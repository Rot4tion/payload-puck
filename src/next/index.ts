/**
 * Next.js Configuration Wrapper for Puck CSS
 *
 * Compiles CSS at build time using the project's PostCSS/Tailwind configuration.
 * This ensures the editor iframe styles work in production (Vercel, etc.) where
 * source files aren't available at runtime.
 *
 * @example
 * ```js
 * // next.config.js
 * import { withPuckCSS } from '@delmaredigital/payload-puck/next'
 * import { withPayload } from '@payloadcms/next/withPayload'
 *
 * export default withPuckCSS({
 *   cssInput: 'src/app/(frontend)/globals.css',
 * })(withPayload(nextConfig))
 * ```
 */

import type { NextConfig } from 'next'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join, resolve } from 'path'

/**
 * Options for the withPuckCSS wrapper
 */
export interface WithPuckCSSOptions {
  /**
   * Path to the source CSS file (relative to project root)
   * @example 'src/app/(frontend)/globals.css'
   */
  cssInput: string

  /**
   * Output path for compiled CSS (relative to public/)
   * @default 'puck-editor-styles.css'
   */
  cssOutput?: string

  /**
   * Whether to skip compilation in development
   * @default true
   */
  skipInDev?: boolean
}

/**
 * Default output filename for compiled CSS
 */
export const PUCK_CSS_OUTPUT_DEFAULT = 'puck-editor-styles.css'

/**
 * Compile CSS using PostCSS with the project's configuration
 */
async function compileCss(css: string, filePath: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let postcss: any
  try {
    postcss = (await import('postcss')).default
  } catch {
    console.warn('[payload-puck] PostCSS not found. CSS will not be compiled.')
    return css
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let processor: any

  try {
    // Try to load project's postcss.config.js
    const loadConfigModule = await import('postcss-load-config')
    const postcssLoadConfig = loadConfigModule.default
    const { plugins } = await postcssLoadConfig({}, process.cwd())
    processor = postcss(plugins)
  } catch {
    // Fall back to direct Tailwind import
    try {
      const tailwindcss = (await import('@tailwindcss/postcss')).default
      processor = postcss([tailwindcss])
    } catch {
      try {
        const tailwindcss = (await import('tailwindcss')).default
        processor = postcss([tailwindcss])
      } catch {
        console.warn('[payload-puck] No Tailwind CSS found. CSS will not be compiled.')
        return css
      }
    }
  }

  const result = await processor.process(css, { from: filePath })
  return result.css
}

/**
 * Webpack plugin that compiles CSS at build time
 */
class PuckCSSWebpackPlugin {
  private options: Required<WithPuckCSSOptions>
  private compiled = false

  constructor(options: Required<WithPuckCSSOptions>) {
    this.options = options
  }

  apply(compiler: { hooks: { beforeCompile: { tapPromise: (name: string, fn: () => Promise<void>) => void } } }) {
    compiler.hooks.beforeCompile.tapPromise('PuckCSSWebpackPlugin', async () => {
      // Only compile once per build
      if (this.compiled) return
      this.compiled = true

      const { cssInput, cssOutput, skipInDev } = this.options

      // Skip in development if configured
      if (skipInDev && process.env.NODE_ENV === 'development') {
        console.log('[payload-puck] Skipping CSS compilation in development')
        return
      }

      const inputPath = resolve(process.cwd(), cssInput)
      const outputPath = resolve(process.cwd(), 'public', cssOutput)

      // Check if source file exists
      if (!existsSync(inputPath)) {
        console.error(`[payload-puck] CSS source file not found: ${inputPath}`)
        return
      }

      try {
        console.log(`[payload-puck] Compiling CSS: ${cssInput} -> public/${cssOutput}`)

        // Read source CSS
        const rawCss = readFileSync(inputPath, 'utf-8')

        // Compile with PostCSS/Tailwind
        const compiledCss = await compileCss(rawCss, inputPath)

        // Ensure public directory exists
        const outputDir = dirname(outputPath)
        if (!existsSync(outputDir)) {
          mkdirSync(outputDir, { recursive: true })
        }

        // Write compiled CSS
        writeFileSync(outputPath, compiledCss, 'utf-8')

        console.log(`[payload-puck] CSS compiled successfully (${(compiledCss.length / 1024).toFixed(1)}KB)`)
      } catch (error) {
        console.error('[payload-puck] CSS compilation failed:', error)
      }
    })
  }
}

/**
 * Next.js configuration wrapper that compiles Puck editor CSS at build time
 *
 * @param options - Configuration options
 * @returns A function that wraps your Next.js config
 *
 * @example
 * ```js
 * import { withPuckCSS } from '@delmaredigital/payload-puck/next'
 *
 * export default withPuckCSS({
 *   cssInput: 'src/app/(frontend)/globals.css',
 * })(nextConfig)
 * ```
 */
export function withPuckCSS(options: WithPuckCSSOptions) {
  const resolvedOptions: Required<WithPuckCSSOptions> = {
    cssInput: options.cssInput,
    cssOutput: options.cssOutput ?? PUCK_CSS_OUTPUT_DEFAULT,
    skipInDev: options.skipInDev ?? true,
  }

  return (nextConfig: NextConfig): NextConfig => {
    return {
      ...nextConfig,
      webpack: (webpackConfig, context) => {
        // Add our CSS compilation plugin
        webpackConfig.plugins = webpackConfig.plugins || []
        webpackConfig.plugins.push(new PuckCSSWebpackPlugin(resolvedOptions))

        // Call existing webpack config if present
        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(webpackConfig, context)
        }

        return webpackConfig
      },
    }
  }
}

/**
 * Get the URL path for the compiled CSS file
 * Use this in your plugin configuration
 */
export function getPuckCSSPath(cssOutput?: string): string {
  return `/${cssOutput ?? PUCK_CSS_OUTPUT_DEFAULT}`
}
