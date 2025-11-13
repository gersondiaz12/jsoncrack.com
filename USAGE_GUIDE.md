# JSON Crack - Node Editing Usage Guide

## Quick Start

### Editing a Node

1. **Open JSON Crack** and load your JSON data in the left editor
2. **View the visualization** on the right side
3. **Click on any node** in the diagram to open the Node Modal
4. **Click the "Edit" button** (appears in the top-right of the modal)
5. **Make your changes**:
   - Edit the key name (for object properties)
   - Edit the value
6. **Click "Save Changes"** to apply
7. **See the updates** reflected in both the JSON editor and visualization

### Example Workflow

**Before:**
```json
{
  "name": "John",
  "age": 30,
  "city": "New York"
}
```

**Steps:**
1. Click on the node showing `name: John`
2. Click "Edit"
3. Change "John" to "Jane"
4. Click "Save Changes"

**After:**
```json
{
  "name": "Jane",
  "age": 30,
  "city": "New York"
}
```

### Renaming Keys

You can also rename object keys:

**Before:**
```json
{
  "firstName": "John"
}
```

**Steps:**
1. Click on the node
2. Click "Edit"
3. Change "firstName" to "name"
4. Click "Save Changes"

**After:**
```json
{
  "name": "John"
}
```

### Editing Multiple Properties

If a node contains multiple properties, you can edit them all at once:

**Before:**
```json
{
  "user": {
    "name": "John",
    "age": 30
  }
}
```

**Steps:**
1. Click on the "user" object node
2. Click "Edit"
3. Edit both "name" and "age" fields
4. Click "Save Changes"

### Type Handling

The editor automatically preserves data types:
- **Numbers**: `42` stays as a number
- **Booleans**: `true`/`false` stay as booleans
- **Strings**: `"hello"` stays as a string
- **Null**: `null` stays as null

### Tips

- ✅ Use the "Cancel" button to discard changes
- ✅ Toast notifications will confirm successful saves
- ✅ Error messages will appear if something goes wrong
- ✅ Changes are immediately reflected in the visualization
- ⚠️ You cannot edit array or object nodes directly (only their primitive values)

### Keyboard Shortcuts

- **Tab**: Move between input fields
- **Enter**: (in last field) Save changes
- **Escape**: Close modal

## Troubleshooting

### "Failed to update node" Error
- Check that your JSON is valid
- Ensure you're not trying to edit an array or object node
- Verify the value matches the expected type

### Changes Not Appearing
- Make sure you clicked "Save Changes"
- Check that the JSON editor on the left updated
- Try refreshing the visualization

### Cannot Edit Button
- The "Edit" button only appears for nodes with editable properties
- Array and object nodes cannot be edited directly
- Try clicking on their child nodes instead

## Advanced Usage

### Editing Nested Objects

For deeply nested structures:
```json
{
  "company": {
    "department": {
      "employee": {
        "name": "John"
      }
    }
  }
}
```

1. Navigate to the deepest node you want to edit
2. Click on it to open the modal
3. Edit as usual

### Working with Arrays

While you cannot edit array nodes directly, you can edit their items:
```json
{
  "users": [
    { "name": "John" },
    { "name": "Jane" }
  ]
}
```

1. Click on individual array item nodes
2. Edit their properties
3. Save changes

## Best Practices

1. **Make small changes**: Edit one node at a time for better control
2. **Verify changes**: Check the JSON editor to confirm updates
3. **Use Cancel**: Don't hesitate to cancel if you make a mistake
4. **Save frequently**: Changes are only applied when you click "Save Changes"
