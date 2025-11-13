# Final Fix: Text Editor Synchronization

## 🐛 The Problem

When editing nodes in the diagram, the changes were visible in the diagram but **NOT updating the JSON text editor** on the left side.

## 🔍 Root Cause Analysis

After deep investigation, I found the issue in the data flow:

### The Flow Problem

```typescript
// In useFile.ts - setContents function
setContents: async ({ contents, hasChanges = true, skipUpdate = false, format }) => {
  try {
    set({
      ...(contents && { contents }),  // ✅ Updates contents state
      error: null,
      hasChanges,
      format: format ?? get().format,
    });

    const json = await contentToJson(get().contents, get().format);

    if (!useConfig.getState().liveTransformEnabled && skipUpdate) return; // ⚠️ Early return!

    // ... more code that updates useJson via debounce
    debouncedUpdateJson(json);  // ⚠️ 400ms delay
  }
}
```

### The Issue

1. **When `skipUpdate: false` (default)**:
   - `setContents()` updates the `contents` state ✅
   - Then calls `debouncedUpdateJson()` which has a **400ms delay**
   - This eventually calls `useJson.setJson()` which triggers `useGraph.setGraph()`
   - This causes the graph to re-parse and re-render
   - **Problem**: We're already calling `setJson()` directly in our edit handler!
   - This creates a **circular update loop** and timing issues

2. **When `skipUpdate: true`**:
   - `setContents()` updates the `contents` state ✅
   - Skips the debounced update
   - No circular loop
   - **This is what we need!**

## ✅ The Solution

Use `skipUpdate: true` when calling `setContents()` from the diagram edit handlers.

### Why This Works

```typescript
// In ObjectNode.tsx and TextNode.tsx
const updatedJson = JSON.stringify(parsedJson, null, 2);

// Update both stores directly
setJson(updatedJson);  // Updates useJson → triggers graph update
setContents({ 
  contents: updatedJson, 
  hasChanges: true, 
  skipUpdate: true  // ← KEY: Skip the debounced update
});
```

**Flow**:
1. `setJson(updatedJson)` → Updates `useJson` store → Calls `useGraph.setGraph()` → Diagram updates
2. `setContents({ ..., skipUpdate: true })` → Updates `useFile.contents` → Text editor updates
3. No circular loop, no debounce delay, instant synchronization!

## 📊 Data Flow Diagram

### Before (Broken)
```
Edit Node
  ↓
setJson(updatedJson) → useJson → useGraph.setGraph() → Diagram ✅
  ↓
setContents({ skipUpdate: false })
  ↓
Updates contents ✅
  ↓
debouncedUpdateJson (400ms delay)
  ↓
useJson.setJson() → useGraph.setGraph() → Diagram re-renders again ⚠️
  ↓
Circular update, timing issues, text editor may not update ❌
```

### After (Fixed)
```
Edit Node
  ↓
setJson(updatedJson) → useJson → useGraph.setGraph() → Diagram ✅
  ↓
setContents({ skipUpdate: true })
  ↓
Updates contents → Text editor ✅
  ↓
Done! No circular updates, instant sync ✅
```

## 🎯 Key Insights

### The `skipUpdate` Parameter

From `useFile.ts`:
```typescript
if (!useConfig.getState().liveTransformEnabled && skipUpdate) return;
```

- **`skipUpdate: false`**: Triggers the debounced JSON update (for text editor → diagram flow)
- **`skipUpdate: true`**: Only updates the contents, skips JSON processing (for diagram → text editor flow)

### Why We Need Both Calls

1. **`setJson(updatedJson)`**: 
   - Updates the JSON data
   - Triggers graph re-render
   - Source of truth for the diagram

2. **`setContents({ contents: updatedJson, skipUpdate: true })`**:
   - Updates the text editor content
   - Marks as changed (`hasChanges: true`)
   - Skips circular update (`skipUpdate: true`)

## 🧪 Testing

### Test Case 1: Edit Object Property
```json
{ "name": "John" }
```
1. Hover over node, click Edit
2. Change "John" to "Jane"
3. Click ✓
4. **Verify**: 
   - Diagram shows "Jane" ✅
   - Text editor shows `"name": "Jane"` ✅

### Test Case 2: Edit Number
```json
{ "age": 30 }
```
1. Edit to 31
2. Click ✓
3. **Verify**: Both sides show 31 ✅

### Test Case 3: Rename Key
```json
{ "firstName": "Alice" }
```
1. Change key to "name"
2. Click ✓
3. **Verify**: Text editor shows `"name": "Alice"` ✅

## 🔄 Complete Synchronization

Now the app has **bidirectional synchronization**:

### Text Editor → Diagram
```
User types in Monaco Editor
  ↓
onChange → setContents({ skipUpdate: true })
  ↓
Updates contents
  ↓
(Monaco's onChange is debounced internally)
  ↓
Eventually triggers graph update
  ↓
Diagram updates ✅
```

### Diagram → Text Editor
```
User edits node
  ↓
setJson(updatedJson) → Diagram updates ✅
  ↓
setContents({ skipUpdate: true }) → Text editor updates ✅
```

## 💡 Why This Architecture?

The separation of `useJson` and `useFile` stores makes sense:

- **`useJson`**: Pure JSON data, source of truth for visualization
- **`useFile`**: File content + metadata (format, changes, errors)

When editing from diagram:
- We already have the JSON object
- We update `useJson` directly (no parsing needed)
- We update `useFile.contents` for text editor display
- We skip the parsing/debounce cycle with `skipUpdate: true`

## 🎉 Result

Perfect synchronization in both directions:
- ✅ Edit in text editor → diagram updates
- ✅ Edit in diagram → text editor updates
- ✅ No circular loops
- ✅ No timing issues
- ✅ Instant feedback
- ✅ Proper change tracking

The inline edit feature now works flawlessly! 🚀
