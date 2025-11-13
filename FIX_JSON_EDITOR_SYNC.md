# Fix: JSON Editor Not Updating

## 🐛 Problem

When editing a node in the diagram, the changes were updating the visualization but **not updating the JSON text editor** on the left side.

## 🔍 Root Cause

The code was only calling `setJson()` which updates the `useJson` store (used by the diagram), but **not** updating the `useFile` store which manages the Monaco text editor content.

### The Two Stores

1. **useJson** - Manages the JSON data for the diagram
2. **useFile** - Manages the text content in the Monaco editor

Both need to be updated for full synchronization!

## ✅ Solution

Added `setContents()` call to update the text editor whenever we save changes.

### Changes Made

#### ObjectNode.tsx
```typescript
// Before
setJson(JSON.stringify(parsedJson, null, 2));

// After
const updatedJson = JSON.stringify(parsedJson, null, 2);
setJson(updatedJson);
setContents({ contents: updatedJson, hasChanges: true });
```

#### TextNode.tsx
```typescript
// Before
setJson(JSON.stringify(parsedJson, null, 2));

// After
const updatedJson = JSON.stringify(parsedJson, null, 2);
setJson(updatedJson);
setContents({ contents: updatedJson, hasChanges: true });
```

### Added Imports
```typescript
import useFile from "../../../../../store/useFile";

// In component
const setContents = useFile(state => state.setContents);
```

## 🎯 How It Works Now

```
User edits node → Click save → 
  ↓
Update JSON object → Stringify →
  ↓
setJson(updatedJson) → Updates diagram
  ↓
setContents({ contents: updatedJson }) → Updates text editor
  ↓
Both sides now show the updated data! ✅
```

## 🧪 Testing

### Test Case 1: Edit Object Property
1. Load JSON: `{ "name": "John" }`
2. Hover over node, click Edit
3. Change "John" to "Jane"
4. Click ✓
5. **Verify**: Both diagram AND text editor show "Jane"

### Test Case 2: Edit Number
1. Load JSON: `{ "age": 30 }`
2. Edit the value to 31
3. Click ✓
4. **Verify**: Both sides show 31

### Test Case 3: Rename Key
1. Load JSON: `{ "firstName": "Alice" }`
2. Edit key to "name"
3. Click ✓
4. **Verify**: Text editor shows `"name": "Alice"`

## 📊 Data Flow

### Before (Broken)
```
Edit Node → setJson() → useJson store → Diagram updates ✅
                                      → Text editor ❌ (not updated)
```

### After (Fixed)
```
Edit Node → setJson() → useJson store → Diagram updates ✅
         → setContents() → useFile store → Text editor updates ✅
```

## 🎉 Result

Now when you edit any node:
- ✅ Diagram updates immediately
- ✅ JSON text editor updates immediately
- ✅ Both sides stay perfectly synchronized
- ✅ Changes are marked as unsaved (hasChanges: true)

## 🔧 Technical Details

### Why Two Stores?

The architecture separates concerns:
- **useJson**: Pure JSON data (source of truth for diagram)
- **useFile**: File content + format + metadata (for text editor)

When editing from the diagram, we need to update both:
1. `setJson()` - Updates the JSON and triggers diagram re-render
2. `setContents()` - Updates the text editor content

### The setContents Parameters

```typescript
setContents({ 
  contents: updatedJson,  // The new JSON string
  hasChanges: true        // Mark as modified (shows unsaved indicator)
})
```

This ensures:
- Text editor displays the new content
- User sees unsaved changes indicator
- Session storage is updated (if applicable)

## 💡 Key Takeaway

In JSON Crack, to fully update the application state:
- **From text editor → diagram**: `setContents()` handles it (already working)
- **From diagram → text editor**: Need both `setJson()` AND `setContents()`

Now both directions work perfectly! 🚀
