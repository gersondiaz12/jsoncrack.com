# Quick Start: Inline Edit Feature

## 🚀 Get Started in 3 Steps

### 1. Start the App
```bash
pnpm dev
```
Open http://localhost:3000/editor

### 2. Load Some JSON
Paste this example:
```json
{
  "user": {
    "name": "John",
    "age": 30,
    "email": "john@example.com"
  },
  "active": true
}
```

### 3. Edit a Node
1. **Hover** over any node in the diagram (right side)
2. **Click** the "✎ Edit" button that appears
3. **Modify** the values
4. **Click ✓** to save

That's it! Both the diagram and JSON editor update instantly.

## 📸 Visual Guide

### Before Editing
```
┌─────────────────────────┐
│  user                   │
│  ┌───────────────────┐  │
│  │ name: John        │  │  ← Hover here
│  │ age: 30           │  │
│  │ email: john@...   │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

### On Hover
```
┌─────────────────────────┐
│  user          [✎ Edit] │  ← Edit button appears
│  ┌───────────────────┐  │
│  │ name: John        │  │
│  │ age: 30           │  │
│  │ email: john@...   │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

### In Edit Mode
```
┌─────────────────────────────────┐
│  user                           │
│  ┌───────────────────────────┐  │
│  │ [name ] [John    ] [✓][✕]│  │  ← Edit inputs
│  │ [age  ] [30      ] [✓][✕]│  │
│  │ [email] [john@...] [✓][✕]│  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### After Saving
```
┌─────────────────────────┐
│  user                   │
│  ┌───────────────────┐  │
│  │ name: Jane        │  │  ← Updated!
│  │ age: 31           │  │  ← Updated!
│  │ email: jane@...   │  │  ← Updated!
│  └───────────────────┘  │
└─────────────────────────┘
```

## 🎯 Common Use Cases

### Change a Value
```
Hover → Click ✎ → Edit value → Click ✓
```

### Rename a Key
```
Hover → Click ✎ → Edit key field → Click ✓
```

### Edit Multiple Properties
```
Hover → Click ✎ → Edit all fields → Click ✓
```

### Cancel Changes
```
Hover → Click ✎ → Make changes → Click ✕
```

## 💡 Pro Tips

1. **Quick edits**: Just hover, click, edit, save - super fast!
2. **Type safety**: Numbers stay numbers, booleans stay booleans
3. **Undo mistakes**: Click ✕ to cancel without saving
4. **Multiple edits**: Edit one node, then another - all changes persist
5. **Visual feedback**: Toast notifications confirm your saves

## 🎨 What Can You Edit?

### ✅ Editable
- String values: `"John"` → `"Jane"`
- Numbers: `42` → `100`
- Booleans: `true` → `false`
- Property keys: `firstName` → `name`
- Null values: `null` → `"something"`

### ⚠️ Not Editable (Yet)
- Array nodes (edit their items instead)
- Object nodes (edit their properties instead)

## 🔥 Try These Examples

### Example 1: Update User Info
```json
{
  "user": {
    "name": "Alice",
    "age": 25
  }
}
```
**Task**: Change name to "Bob" and age to 30

### Example 2: Toggle Status
```json
{
  "status": "active",
  "verified": false
}
```
**Task**: Change status to "inactive" and verified to true

### Example 3: Rename Properties
```json
{
  "firstName": "John",
  "lastName": "Doe"
}
```
**Task**: Rename to "name" and "surname"

## 🐛 Troubleshooting

**Edit button not appearing?**
- Make sure you're hovering over the node
- Check if the node has editable values (not array/object)

**Changes not saving?**
- Make sure you clicked ✓ (not ✕)
- Check for error toast messages
- Verify JSON is valid

**Can't edit a node?**
- Array and object nodes can't be edited directly
- Try editing their child nodes instead

## 🎉 Success!

You now have a powerful inline editing feature that makes JSON editing visual and intuitive. No more switching between the diagram and text editor - just hover, click, edit, and save!

## 📚 More Information

For detailed documentation, see:
- **INLINE_EDIT_FEATURE.md** - Complete feature documentation
- **PROJECT_ARCHITECTURE.md** - How the app works
- **COMPLETE_UNDERSTANDING.md** - Deep technical dive
