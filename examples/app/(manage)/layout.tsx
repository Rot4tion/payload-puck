/**
 * Layout for Puck Editor routes
 *
 * IMPORTANT: This layout must import your Tailwind CSS for the editor to be styled.
 * Update the import path to match your project's globals.css location.
 */

// Import your Tailwind CSS - adjust path as needed
import '@/app/(frontend)/globals.css'
// Or if your globals.css is elsewhere:
// import '@/styles/globals.css'
// import '../globals.css'

export const metadata = {
  title: 'Puck Editor',
  description: 'Visual page editor',
}

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // NOTE: data-theme="light" is required if your CSS uses opacity:0 until theme is set
    // (common FOUC prevention pattern). Adjust to match your theme system.
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  )
}
