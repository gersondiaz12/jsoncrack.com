# Node Edit Feature

## Overview
This feature allows users to edit JSON data directly from the interactive diagram visualization, without needing to manually edit the JSON text on the left side.

## What's New

### Edit Button in Node Modal
When you click on a node in the visualization, the Node Modal now includes an **Edit** button that allows you to modify:
- **Keys**: Rename object property keys
- **Values**: Update the values of properties

### How to Use

1. **Click on any node** in the visualization to open the Node Modal
2. **Click the "Edit" button** in the top-right corner of the modal
3. **Modify the fields**:
   - For object properties: Edit both the key name and value
   - For simple values: Edit the content directly
4. **Click "Save"** to apply changes to the JSON
5. **Click "Cancel"** to discard changes

### Features

- ✅ Edit property keys (rename them)
- ✅ Edit property values
- ✅ Automatic type preservation (numbers, booleans, strings, null)
- ✅ Real-time JSON update - changes reflect immediately in both the text editor and visualization
- ✅ Toast notifications for success/error feedback
- ✅ Cancel functionality to discard changes

### Limitations

- Cannot edit array or object nodes directly (only their primitive properties)
- Cannot add or remove properties (only edit existing ones)
- Cannot change the type of a value (e.g., string to number)

## Technical Implementation

### Modified Files

1. **src/features/modals/NodeModal/index.tsx**
   - Added edit mode state management
   - Implemented form inputs for key/value editing
   - Added save/cancel functionality
   - Integrated with JSON store to update the source data

### How It Works

1. When "Edit" is clicked, the modal switches to edit mode
2. Text inputs are rendered for each editable property
3. On "Save":
   - The current JSON is parsed
   - The target node is located using the JSON path
   - Values are updated (with proper type conversion)
   - Keys are renamed if changed (old key deleted, new key added)
   - The updated JSON is stringified and saved back to the store
4. The graph automatically re-renders with the new data

## Future Enhancements

Possible improvements for future versions:
- Add/remove properties from objects
- Add/remove items from arrays
- Change value types
- Customize node colors per node
- Bulk edit multiple nodes
- Undo/redo functionality
- Validation rules for keys and values
