# Puck Core Issue: Rich Text Style Changes Not Triggering Dirty State

## Summary

When using Tiptap-based rich text fields in Puck, changes to text styles via dropdown controls (font size, text color, highlight) are not immediately recognized by Puck's change detection. The editor only registers these changes after a subsequent content edit (typing, applying bold/italic, etc.).

**Affected Version:** `@puckeditor/core@0.21.0`

## Symptoms

- Change font size via dropdown → No "unsaved changes" indicator
- Change text color via color picker → No "unsaved changes" indicator
- Apply bold/italic/underline → Changes are immediately recognized ✓
- Type any character → Changes are immediately recognized ✓

The style changes ARE being applied to the content (HTML is correct), but Puck doesn't recognize the document as "dirty" until another edit is made.

## Root Cause

The issue is in Puck's `useSyncedEditor` hook (located in `@puckeditor/core/dist/index.js`).

### The Problematic Code

```javascript
// In useSyncedEditor hook (~line 5140-5165)
onUpdate: ({ editor: editor2 }) => {
  if (syncingRef.current || !isFocused) {
    appStoreApi.getState().setUi({ field: { focus: name } });
    return;  // ← EARLY EXIT - changes are dropped!
  }

  const html = editor2.getHTML();
  const { from, to } = editor2.state.selection;
  setDebouncedState({ from, to, html });
  // ... rest of update logic
}
```

### Why This Happens

1. **User clicks font size dropdown** → Focus moves from Tiptap editor to the dropdown menu
2. **User selects a font size** → Control calls `editor.chain().focus().setFontSize(value).run()`
3. **Tiptap's `onUpdate` fires** → The chain's `.focus()` call brings focus back to editor
4. **BUT: `isFocused` React state is stale** → Puck's `isFocused` state hasn't updated yet
5. **Guard condition fails** → `!isFocused` is true, so the function returns early
6. **Change is silently dropped** → `setDebouncedState` is never called

Bold/italic/underline work because they're typically applied via:
- Keyboard shortcuts (focus never leaves the editor)
- Toolbar buttons that don't capture focus

## Why The Current Implementation Is Problematic

### 1. Race Condition Between Focus State and Editor Updates

The `isFocused` state is managed by React, which batches state updates. When the editor command chain calls `.focus()`, it immediately focuses the DOM element, but React's state update is scheduled for the next tick. By the time Tiptap's `onUpdate` callback fires (synchronously after the command), `isFocused` is still `false`.

### 2. Dropdown Controls Are Common

Many rich text controls use dropdowns:
- Font size selectors
- Font family selectors
- Color pickers
- Link dialogs
- Table tools

All of these move focus away from the editor temporarily.

### 3. Silent Failure

The worst part is that changes appear to work visually (the text changes), but:
- The "dirty" indicator doesn't show
- Undo history isn't updated
- Auto-save (if configured) doesn't trigger
- Users may lose changes if they navigate away

## Recommended Fix for Puck Core

### Option 1: Remove the Focus Guard (Preferred)

The `isFocused` guard seems overly aggressive. If `syncingRef.current` is false, the change is legitimate and should be recorded.

```javascript
onUpdate: ({ editor: editor2 }) => {
  if (syncingRef.current) {
    return;  // Only skip during sync operations
  }

  // Always process updates when not syncing
  const html = editor2.getHTML();
  const { from, to } = editor2.state.selection;
  setDebouncedState({ from, to, html });
  // ...
}
```

### Option 2: Use a Short Delay for Focus Check

If the focus guard is intentional (e.g., to prevent updates from programmatic changes), add a microtask delay:

```javascript
onUpdate: ({ editor: editor2 }) => {
  if (syncingRef.current) return;

  // Allow React state to settle
  queueMicrotask(() => {
    const html = editor2.getHTML();
    const { from, to } = editor2.state.selection;
    setDebouncedState({ from, to, html });
  });
}
```

### Option 3: Track Focus via DOM (Most Robust)

Instead of relying on React state, check actual DOM focus:

```javascript
onUpdate: ({ editor: editor2 }) => {
  if (syncingRef.current) return;

  // Check if editor or its children have focus
  const editorElement = editor2.view.dom;
  const hasFocus = editorElement.contains(document.activeElement);

  // Also accept updates immediately after focus (within 100ms)
  const recentlyFocused = Date.now() - lastFocusTime < 100;

  if (!hasFocus && !recentlyFocused) {
    return;
  }

  const html = editor2.getHTML();
  // ...
}
```

## Current Workaround (In payload-puck)

Until this is fixed in Puck core, we've implemented a workaround in the `@delmaredigital/payload-puck` plugin:

```typescript
// src/fields/richtext/controls/shared.ts

/**
 * Forces Puck to recognize editor changes after applying text styles.
 */
export function forcePuckUpdate(editor: Editor): void {
  // Use setTimeout to ensure React state has settled after focus change
  setTimeout(() => {
    if (editor.isDestroyed) return;

    // Insert and immediately delete a zero-width space to force a document change
    // This triggers Puck's onUpdate with the focus state now correctly set
    const { from } = editor.state.selection;
    editor
      .chain()
      .focus()
      .insertContentAt(from, '\u200B') // Zero-width space
      .deleteRange({ from, to: from + 1 })
      .run();
  }, 50);
}
```

This is called after every style change in our controls:

```typescript
const handlePresetClick = useCallback((value: string | null) => {
  if (value) {
    editor.chain().focus().setFontSize(value).run();
  } else {
    editor.chain().focus().unsetFontSize().run();
  }
  setIsOpen(false);
  forcePuckUpdate(editor);  // ← Force Puck to recognize the change
}, [editor]);
```

The workaround:
1. Waits 50ms for React state to settle (focus state update)
2. Re-focuses the editor (in case focus was lost)
3. Inserts and immediately deletes a zero-width space character
4. This forces a real document change that triggers Puck's `onUpdate`
5. By this time, `isFocused` is true, so the change is properly recorded

**Note:** Simple selection changes (`setTextSelection`) don't trigger `onUpdate` because
they don't change the document content. We need an actual content change to trigger the
update callback.

## Impact

This affects any custom Tiptap extension that uses dropdown-based controls. The built-in Puck rich text field doesn't have many dropdown controls, which is likely why this wasn't caught earlier.

## Related Links

- Puck GitHub: https://github.com/measuredco/puck
- Tiptap Documentation: https://tiptap.dev/docs/editor/api/commands/focus
- React State Batching: https://react.dev/learn/queueing-a-series-of-state-updates

---

*Last updated: 2026-01-19*
*Workaround implemented in: @delmaredigital/payload-puck@0.6.4-dev.11+*
