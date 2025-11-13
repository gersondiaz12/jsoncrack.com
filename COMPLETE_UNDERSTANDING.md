# Complete Understanding: JSON Crack & Edit Feature

## What is JSON Crack?

JSON Crack is a **visual JSON editor** that displays JSON data in two synchronized views:
- **Left side**: Text editor (Monaco - same as VS Code)
- **Right side**: Interactive diagram showing JSON structure as connected nodes

## How to Access the JSON and Diagram

### Accessing JSON Data (Left Side)

**From any component:**
```typescript
import useJson from "../store/useJson";
import useFile from "../store/useFile";

// Get the JSON string
const json = useJson(state => state.json);

// Get the raw text content (could be JSON, YAML, XML, CSV)
const contents = useFile(state => state.contents);

// Update JSON (triggers diagram update automatically)
const setJson = useJson(state => state.setJson);
setJson('{"name": "John"}');
```

**The text editor component:**
```typescript
// src/features/editor/TextEditor.tsx
const contents = useFile(state => state.contents);  // Current text
const setContents = useFile(state => state.setContents);  // Update text

// Monaco Editor
<Editor
  value={contents}
  onChange={contents => setContents({ contents, skipUpdate: true })}
/>
```

### Accessing Diagram Data (Right Side)

**From any component:**
```typescript
import useGraph from "../features/editor/views/GraphView/stores/useGraph";

// Get all nodes in the diagram
const nodes = useGraph(state => state.nodes);
// nodes = [
//   { id: "1", text: [...], width: 150, height: 60, path: ["user"] },
//   { id: "2", text: [...], width: 200, height: 90, path: ["user", "address"] }
// ]

// Get all edges (connections between nodes)
const edges = useGraph(state => state.edges);
// edges = [
//   { id: "1", from: "1", to: "2", text: "address" }
// ]

// Get the currently selected node (when user clicks)
const selectedNode = useGraph(state => state.selectedNode);
```

**The diagram component:**
```typescript
// src/features/editor/views/GraphView/index.tsx
const nodes = useGraph(state => state.nodes);
const edges = useGraph(state => state.edges);

<Canvas
  nodes={nodes}
  edges={edges}
  node={p => <CustomNode {...p} />}
  edge={p => <CustomEdge {...p} />}
/>
```

## How They Stay Synchronized

### The Magic Connection

**When you type in the text editor:**
```
1. User types in Monaco Editor
2. onChange fires → useFile.setContents()
3. setContents() converts text to JSON → contentToJson()
4. Calls useJson.setJson(json)
5. setJson() automatically calls useGraph.setGraph(json)
6. setGraph() runs parser() to create nodes/edges
7. React re-renders the diagram with new nodes
```

**When you edit in the diagram:**
```
1. User clicks node → NodeModal opens
2. User edits and clicks Save
3. handleSave() updates the JSON string
4. Calls useJson.setJson(updatedJson)
5. [Same flow as above - steps 5-7]
6. Both text editor and diagram update
```

### The Key Code That Connects Them

**File: `src/store/useJson.ts`**
```typescript
setJson: json => {
  set({ json, loading: false });
  useGraph.getState().setGraph(json);  // ← This is the magic line!
}
```

Every time the JSON changes (from either side), this function:
1. Updates the JSON in the store
2. Automatically triggers the graph to update

## Understanding the Node Structure

### What is a Node?

A node is a visual box in the diagram representing part of your JSON.

**Example JSON:**
```json
{
  "user": {
    "name": "John",
    "age": 30
  }
}
```

**Becomes 2 nodes:**

**Node 1** (the "user" object):
```typescript
{
  id: "1",
  text: [
    { key: "user", value: "{2 keys}", type: "object" }
  ],
  width: 150,
  height: 30,
  path: []  // Root level
}
```

**Node 2** (the properties inside "user"):
```typescript
{
  id: "2",
  text: [
    { key: "name", value: "John", type: "string" },
    { key: "age", value: 30, type: "number" }
  ],
  width: 200,
  height: 60,
  path: ["user"]  // Path to this node in JSON
}
```

**Edge** (connecting them):
```typescript
{
  id: "1",
  from: "1",  // From Node 1
  to: "2",    // To Node 2
  text: "user"  // Label on the connection
}
```

### The Path Property

The `path` is crucial - it tells you where in the JSON this node lives:

```typescript
path: ["user", "address", "city"]
// Means: json["user"]["address"]["city"]

path: ["items", 0, "name"]
// Means: json["items"][0]["name"]

path: []
// Means: root level
```

## How the Edit Feature Works

### Step-by-Step Process

**1. User clicks a node in the diagram**
```typescript
// src/features/editor/views/GraphView/CustomNode/index.tsx
const handleNodeClick = (_, data: NodeData) => {
  setSelectedNode(data);  // Store the clicked node
  setVisible("NodeModal", true);  // Open the modal
};
```

**2. NodeModal opens with node data**
```typescript
// src/features/modals/NodeModal/index.tsx
const nodeData = useGraph(state => state.selectedNode);
// nodeData contains:
// - text: [{ key: "name", value: "John", type: "string" }]
// - path: ["user"]
```

**3. User clicks "Edit" button**
```typescript
const [isEditing, setIsEditing] = useState(false);
const [editedRows, setEditedRows] = useState(nodeData.text);

// Edit button click
<Button onClick={() => setIsEditing(true)}>Edit</Button>
```

**4. Text inputs appear**
```typescript
{editedRows.map((row, index) => (
  <Group>
    <TextInput
      label="Key"
      value={row.key}
      onChange={e => handleRowChange(index, "key", e.target.value)}
    />
    <TextInput
      label="Value"
      value={row.value}
      onChange={e => handleRowChange(index, "value", e.target.value)}
    />
  </Group>
))}
```

**5. User modifies and clicks "Save Changes"**
```typescript
const handleSave = () => {
  // 1. Get current JSON
  const currentJson = getJson();  // "{ "user": { "name": "John" } }"
  const parsedJson = JSON.parse(currentJson);  // Convert to object
  
  // 2. Navigate to the target using path
  const path = nodeData.path;  // ["user"]
  let target = parsedJson;
  for (let i = 0; i < path.length - 1; i++) {
    target = target[path[i]];
  }
  // Now target = parsedJson["user"]
  
  // 3. Update the value
  const lastKey = path[path.length - 1];  // "user"
  target[lastKey] = newValue;
  
  // 4. Save back to store
  setJson(JSON.stringify(parsedJson, null, 2));
  // This triggers the entire update flow!
};
```

**6. Both sides update automatically**
```
setJson() → useGraph.setGraph() → parser() → new nodes/edges → 
Text editor shows new JSON + Diagram shows new nodes
```

### Handling Key Renames

When a user changes a key name (e.g., "firstName" → "name"):

```typescript
const originalKey = "firstName";
const newKey = "name";

if (originalKey !== newKey) {
  // Delete old key
  delete targetObj[originalKey];
  
  // Add new key with the value
  targetObj[newKey] = value;
}
```

### Type Preservation

The edit feature preserves data types:

```typescript
const parseValue = (value: any, type: string) => {
  if (type === "number") return Number(value);
  if (type === "boolean") return value === "true" || value === true;
  if (type === "null") return null;
  return value;  // string
};
```

So if you edit a number, it stays a number (not converted to string).

## Real-World Example

### Initial JSON
```json
{
  "user": {
    "firstName": "John",
    "age": 30
  }
}
```

### User Actions
1. Clicks on the node showing "firstName: John" and "age: 30"
2. Modal opens
3. Clicks "Edit"
4. Changes "firstName" to "name"
5. Changes "John" to "Jane"
6. Changes 30 to 31
7. Clicks "Save Changes"

### What Happens Behind the Scenes
```typescript
// 1. Get current JSON
const json = '{"user":{"firstName":"John","age":30}}';
const obj = JSON.parse(json);
// obj = { user: { firstName: "John", age: 30 } }

// 2. Navigate to target
const path = ["user"];
let target = obj;  // Start at root
// No loop needed since path.length - 1 = 0

// 3. Get the target object
const targetObj = obj["user"];
// targetObj = { firstName: "John", age: 30 }

// 4. Handle key rename
delete targetObj["firstName"];
targetObj["name"] = "Jane";
// targetObj = { name: "Jane", age: 30 }

// 5. Update age
targetObj["age"] = 31;
// targetObj = { name: "Jane", age: 31 }

// 6. Save
const newJson = JSON.stringify(obj, null, 2);
setJson(newJson);
```

### Result
```json
{
  "user": {
    "name": "Jane",
    "age": 31
  }
}
```

Both the text editor and diagram now show the updated data!

## Key Takeaways

### How to Access Data

1. **JSON text**: `useJson(state => state.json)`
2. **Raw content**: `useFile(state => state.contents)`
3. **Diagram nodes**: `useGraph(state => state.nodes)`
4. **Selected node**: `useGraph(state => state.selectedNode)`

### How to Update Data

1. **Update JSON**: `useJson.getState().setJson(newJson)`
   - Automatically updates both text editor and diagram
   
2. **Update text**: `useFile.getState().setContents({ contents: newText })`
   - Converts to JSON and updates diagram

3. **Update from diagram**: 
   - Modify the JSON object
   - Call `setJson()` with the updated JSON
   - Both sides update automatically

### The Connection

The entire app revolves around **one source of truth**: the JSON string in `useJson` store.

- Text editor reads/writes to this
- Diagram reads from this (via parsed nodes)
- Edit feature writes to this
- Everything stays synchronized automatically

### Why It Works

1. **Zustand** provides reactive state management
2. **React** automatically re-renders when state changes
3. **Parser** converts JSON to visual nodes
4. **Monaco** displays the text
5. **Reaflow** displays the diagram

All connected through simple, clean data flow!

## Testing the Edit Feature

### To test manually:

1. Run `pnpm dev`
2. Open http://localhost:3000/editor
3. Paste this JSON:
```json
{
  "person": {
    "name": "Alice",
    "age": 25
  }
}
```
4. Click on the node showing "name: Alice" and "age: 25"
5. Click "Edit"
6. Change "name" to "fullName"
7. Change "Alice" to "Bob"
8. Click "Save Changes"
9. Verify both sides updated:
   - Left: JSON now shows `"fullName": "Bob"`
   - Right: Diagram shows updated node

## Conclusion

JSON Crack is a beautifully simple yet powerful tool:
- **One source of truth** (JSON in store)
- **Two synchronized views** (text + diagram)
- **Reactive updates** (change one, both update)
- **Clean architecture** (Zustand + React + TypeScript)

The edit feature I built integrates seamlessly by following the same patterns and using the same stores. It's a natural extension of the existing architecture.
