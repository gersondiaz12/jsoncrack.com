# JSON Crack - Project Architecture & Data Flow

## Overview

JSON Crack is a web application built with **Next.js**, **React**, and **TypeScript** that visualizes JSON data as interactive diagrams. The app has a split-pane interface with a text editor on the left and an interactive visualization on the right.

## Core Architecture

### Technology Stack
- **Framework**: Next.js 14 (React 18)
- **State Management**: Zustand
- **UI Components**: Mantine UI
- **Styling**: Styled Components
- **Code Editor**: Monaco Editor (VS Code editor)
- **Graph Visualization**: Reaflow (for rendering nodes and edges)
- **Zoom/Pan**: react-zoomable-ui

### Project Structure
```
src/
├── pages/              # Next.js pages
│   └── editor.tsx      # Main editor page
├── features/           # Feature modules
│   ├── editor/
│   │   ├── TextEditor.tsx      # Left side: Monaco code editor
│   │   ├── LiveEditor.tsx      # Right side: Visualization container
│   │   └── views/
│   │       ├── GraphView/      # Interactive diagram view
│   │       └── TreeView/       # Tree view alternative
│   └── modals/
│       └── NodeModal/          # Modal for viewing/editing nodes
├── store/              # Zustand state stores
│   ├── useJson.ts      # JSON data state
│   ├── useFile.ts      # File/content management
│   └── useConfig.ts    # App configuration
└── types/
    └── graph.ts        # Type definitions for nodes/edges
```

## Data Flow: How JSON Becomes a Diagram

### 1. **User Input → Text Editor**
```
User types JSON → Monaco Editor → useFile.setContents()
```

**File**: `src/features/editor/TextEditor.tsx`
- Monaco Editor displays the JSON text
- On change: `onChange={contents => setContents({ contents, skipUpdate: true })}`
- The `contents` are stored in `useFile` store

### 2. **Text Editor → JSON Store**
```
useFile.setContents() → contentToJson() → useJson.setJson()
```

**File**: `src/store/useFile.ts`
- `setContents()` converts the text to JSON using `contentToJson()`
- Supports multiple formats: JSON, YAML, XML, CSV
- Debounced update (400ms) to avoid excessive re-renders
- Calls `useJson.setJson()` with the parsed JSON

**File**: `src/lib/utils/jsonAdapter.ts`
- `contentToJson()`: Converts text format to JSON object
- `jsonToContent()`: Converts JSON back to text format

### 3. **JSON Store → Graph Store**
```
useJson.setJson() → useGraph.setGraph() → parser()
```

**File**: `src/store/useJson.ts`
```typescript
setJson: json => {
  set({ json, loading: false });
  useGraph.getState().setGraph(json);  // Triggers graph update
}
```

**File**: `src/features/editor/views/GraphView/stores/useGraph.ts`
- `setGraph()` calls the `parser()` function
- Parser converts JSON into nodes and edges

### 4. **Parser: JSON → Nodes & Edges**
```
parser(json) → { nodes: NodeData[], edges: EdgeData[] }
```

**File**: `src/features/editor/views/GraphView/lib/jsonParser.ts`

The parser traverses the JSON tree and creates:
- **Nodes**: Visual boxes representing JSON values
  - Each node has: `id`, `text`, `width`, `height`, `path`
  - `text` contains key-value pairs to display
  - `path` is the JSON path (e.g., `["user", "name"]`)
  
- **Edges**: Lines connecting parent-child relationships
  - Each edge has: `id`, `from`, `to`, `text`

**Example**:
```json
{
  "user": {
    "name": "John",
    "age": 30
  }
}
```

Becomes:
```
Node 1: { text: [{ key: "user", value: "{2 keys}", type: "object" }] }
  ↓ (Edge: "user")
Node 2: { text: [
  { key: "name", value: "John", type: "string" },
  { key: "age", value: 30, type: "number" }
]}
```

### 5. **Graph Store → Visualization**
```
useGraph (nodes, edges) → GraphView → Canvas → CustomNode/CustomEdge
```

**File**: `src/features/editor/views/GraphView/index.tsx`
- `GraphView` component reads nodes/edges from `useGraph`
- Uses `Canvas` from Reaflow library
- Renders each node with `CustomNode` component
- Renders each edge with `CustomEdge` component

**File**: `src/features/editor/views/GraphView/CustomNode/`
- `ObjectNode.tsx`: Renders nodes with key-value pairs
- `TextNode.tsx`: Renders simple value nodes
- Each node is clickable and opens the NodeModal

### 6. **User Interaction: Clicking a Node**
```
Click Node → handleNodeClick → setSelectedNode → NodeModal opens
```

**File**: `src/features/editor/views/GraphView/CustomNode/index.tsx`
```typescript
const handleNodeClick = (_, data: NodeData) => {
  setSelectedNode(data);  // Store selected node
  setVisible("NodeModal", true);  // Open modal
};
```

**File**: `src/features/modals/NodeModal/index.tsx`
- Modal displays node content and JSON path
- Shows "Edit" button for editable nodes
- User can edit keys and values

### 7. **Editing: Node → JSON Update**
```
Edit in Modal → handleSave() → Update JSON → setJson() → Re-render
```

**Flow**:
1. User clicks "Edit" button
2. Text inputs appear for keys/values
3. User modifies data
4. User clicks "Save Changes"
5. `handleSave()` function:
   - Gets current JSON: `getJson()`
   - Parses it: `JSON.parse(currentJson)`
   - Navigates to target using `path`: `target[path[0]][path[1]]...`
   - Updates the value(s)
   - Handles key renames (delete old, add new)
   - Saves back: `setJson(JSON.stringify(parsedJson, null, 2))`
6. This triggers the entire flow again (steps 3-5)
7. Both text editor and visualization update automatically

## Key Stores (Zustand)

### useFile Store
**Purpose**: Manages file content and format
- `contents`: The raw text (JSON, YAML, XML, CSV)
- `format`: Current file format
- `setContents()`: Updates content and triggers JSON conversion
- `setFormat()`: Converts between formats

### useJson Store
**Purpose**: Manages parsed JSON data
- `json`: The JSON string
- `setJson()`: Updates JSON and triggers graph update
- Automatically calls `useGraph.setGraph()` on changes

### useGraph Store
**Purpose**: Manages graph visualization state
- `nodes`: Array of NodeData objects
- `edges`: Array of EdgeData objects
- `selectedNode`: Currently selected node
- `setGraph()`: Parses JSON and creates nodes/edges
- `setSelectedNode()`: Stores clicked node for modal

### useConfig Store
**Purpose**: App settings (dark mode, rulers, etc.)

## Page Layout

**File**: `src/pages/editor.tsx`

```
┌─────────────────────────────────────────┐
│           Toolbar (top)                 │
├──────────────────┬──────────────────────┤
│                  │                      │
│   TextEditor     │    LiveEditor        │
│   (Monaco)       │    (GraphView)       │
│                  │                      │
│   Left Pane      │    Right Pane        │
│   (JSON text)    │    (Visualization)   │
│                  │                      │
├──────────────────┤                      │
│   BottomBar      │                      │
└──────────────────┴──────────────────────┘
```

Uses **Allotment** for resizable split panes:
- Left pane: 450px default, 300-800px range
- Right pane: Flexible
- Can hide left pane in fullscreen mode

## How to Access Data

### From Text Editor (Left Side)
```typescript
import useFile from "../../store/useFile";

const contents = useFile(state => state.contents);  // Get text
const setContents = useFile(state => state.setContents);  // Update text
```

### From Visualization (Right Side)
```typescript
import useGraph from "../stores/useGraph";

const nodes = useGraph(state => state.nodes);  // Get nodes
const edges = useGraph(state => state.edges);  // Get edges
const selectedNode = useGraph(state => state.selectedNode);  // Get clicked node
```

### From Anywhere
```typescript
import useJson from "../../store/useJson";

const json = useJson(state => state.json);  // Get JSON string
const setJson = useJson(state => state.setJson);  // Update JSON
```

## Edit Feature Implementation

### What I Built
Added edit functionality to the NodeModal that allows users to:
1. Click "Edit" button in the modal
2. Modify keys and values in text inputs
3. Save changes back to the JSON
4. See updates in both editor and visualization

### How It Works
1. **Edit Mode**: Toggle between view/edit mode
2. **Form Inputs**: Render TextInput for each editable property
3. **State Tracking**: Store edited values in local state
4. **Save Logic**: 
   - Parse current JSON
   - Navigate to target node using JSON path
   - Update values with type preservation
   - Handle key renames
   - Save back to store
5. **Auto-Update**: Zustand triggers re-render of both panes

### Key Code
```typescript
const handleSave = () => {
  const parsedJson = JSON.parse(getJson());
  const path = nodeData?.path || [];
  
  // Navigate to target
  let target = parsedJson;
  for (let i = 0; i < path.length - 1; i++) {
    target = target[path[i]];
  }
  
  // Update values
  const lastKey = path[path.length - 1];
  target[lastKey] = newValue;
  
  // Save back
  setJson(JSON.stringify(parsedJson, null, 2));
};
```

## Summary

**The Complete Flow**:
```
User Types JSON
    ↓
TextEditor (Monaco)
    ↓
useFile.setContents()
    ↓
contentToJson() [converts format]
    ↓
useJson.setJson()
    ↓
useGraph.setGraph()
    ↓
parser() [JSON → nodes/edges]
    ↓
GraphView renders Canvas
    ↓
CustomNode components display
    ↓
User clicks node
    ↓
NodeModal opens
    ↓
User edits data
    ↓
handleSave() updates JSON
    ↓
[Flow repeats from useJson.setJson()]
```

This architecture ensures that:
- ✅ Changes in text editor update visualization
- ✅ Changes in visualization update text editor
- ✅ All state is centralized in Zustand stores
- ✅ Updates are debounced for performance
- ✅ Type safety with TypeScript throughout
