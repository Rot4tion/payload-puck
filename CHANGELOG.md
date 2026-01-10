# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-01-09

### Breaking Changes

#### Payload Admin UI Integration

The Puck editor now runs inside Payload's admin UI using `DefaultTemplate`. This provides a native admin experience with proper navigation, permissions, and styling.

**Migration:**
- Remove custom editor routes (`app/(manage)/pages/[id]/edit/page.tsx`)
- Remove custom editor layouts
- The plugin now auto-registers the editor view at `/admin/puck-editor/:collection/:id`
- "Edit with Puck" buttons in Payload admin now navigate to the integrated editor

#### PuckConfigProvider Pattern

The Puck configuration is now provided via React context instead of being passed directly to components.

**Before:**
```tsx
// app/(manage)/pages/[id]/edit/page.tsx
import { PuckEditor } from '@delmaredigital/payload-puck/editor'
import { editorConfig } from '@delmaredigital/payload-puck/config/editor'

<PuckEditor config={editorConfig} ... />
```

**After:**
```tsx
// app/(admin)/layout.tsx (or root layout)
import { PuckConfigProvider } from '@delmaredigital/payload-puck/client'
import { editorConfig } from '@delmaredigital/payload-puck/config/editor'

export default function Layout({ children }) {
  return (
    <PuckConfigProvider config={editorConfig}>
      {children}
    </PuckConfigProvider>
  )
}
```

The editor view automatically retrieves the config from context.

#### Build System Change

Migrated from tsup to tsc for simpler, more reliable builds.

- `tsup.config.ts` removed
- Build output structure unchanged
- No changes needed for consumers

### Added

#### Page-Tree Plugin Integration

Automatic integration with `@delmaredigital/payload-page-tree` when detected:

- **Auto-detection**: Checks if collection has `pageSegment` field (page-tree's signature)
- **Folder Picker Field**: Hierarchical folder selection in Puck sidebar
- **Page Segment Field**: Editable URL segment with live slugification
- **Slug Preview Field**: Read-only computed slug preview

When page-tree is active, the Puck editor sidebar shows:
```
Root Fields:
├── Page Title
├── Folder (picker dropdown with tree)
├── Page Segment (editable text, auto-slugified)
└── URL Slug (read-only preview)
```

**Configuration:**
```typescript
createPuckPlugin({
  // Auto-detect (default) - checks for pageSegment field
  pageTreeIntegration: undefined,

  // Explicitly enable with custom config
  pageTreeIntegration: {
    folderSlug: 'payload-folders',
    pageSegmentFieldName: 'pageSegment',
  },

  // Explicitly disable
  pageTreeIntegration: false,
})
```

#### New Field Exports

Three new custom Puck fields for page-tree integration:

```typescript
import {
  createFolderPickerField,
  createPageSegmentField,
  createSlugPreviewField,
} from '@delmaredigital/payload-puck/fields'

// Folder picker with hierarchical tree
const folderField = createFolderPickerField({
  label: 'Folder',
  folderSlug: 'payload-folders',
})

// Page segment with auto-slugification
const segmentField = createPageSegmentField({
  label: 'Page Segment',
})

// Read-only slug preview
const slugField = createSlugPreviewField({
  label: 'URL Slug',
  hint: 'Auto-generated from folder + page segment',
})
```

#### New Export Paths

- `@delmaredigital/payload-puck/client` - Client components including `PuckConfigProvider`
- `@delmaredigital/payload-puck/rsc` - React Server Component exports
- `@delmaredigital/payload-puck/admin/client` - Admin-specific client components

### Changed

- Editor view now uses `DefaultTemplate` from `@payloadcms/next/templates`
- API routes now support `folder` and `pageSegment` fields in save payload
- Folder picker includes "Manage folders" link to `/admin/page-tree`

### Fixed

- Folder picker dropdown now appears inline (fixed `position: relative`)
- Folder picker refreshes folder list when opened (catches newly created folders)
- "No folder" selection no longer breaks the dropdown

---

## [0.2.0] - 2026-01-09

### Breaking Changes

#### Section Component Redesign
The Section component now has a two-layer architecture for more powerful layout control:

- **Section layer** (outer, full-width): Controls the full-bleed background, border, padding, and margin
- **Content layer** (inner, constrained): Controls the content area with max-width, background, border, and padding

**Field renames:**
- `background` → `sectionBackground`
- `border` → `sectionBorder`
- `customPadding` → `sectionPadding`
- `margin` → `sectionMargin`

**New fields:**
- `contentDimensions` - Max-width, min-height for content area (default: 1200px centered)
- `contentBackground` - Background for the content area
- `contentBorder` - Border around the content area
- `contentPadding` - Padding inside the content area

**Removed fields:**
- `fullWidth` - No longer needed; set `contentDimensions` to full width instead

#### Container Component Simplified
The Container component has been simplified to a single-layer organizational wrapper:

**Removed fields:**
- `innerBackground` - Use Section for two-layer backgrounds
- `innerBorder` - Use Section for two-layer borders
- `innerPadding` - Now just `padding`

**Migration:** If you were using Container's inner/outer backgrounds, migrate to Section which now provides this functionality with clearer naming.

### Added

- Changelog file to track breaking changes and new features

### Fixed

- Slot/DropZone now expands to fill container's minHeight in the editor
- RichText component now fills available width (removed Tailwind prose max-width constraint)
- Removed hardcoded padding defaults across components; now properly set via defaultProps

### Changed

- Section component now provides full-bleed background with constrained content area out of the box
- Container component simplified for basic organizational use cases
- Better field grouping in the editor panel (Section styling → Content styling)
- Default content area max-width of 1200px makes the two-layer design immediately visible
