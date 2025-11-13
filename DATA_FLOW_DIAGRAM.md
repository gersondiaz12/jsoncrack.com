# JSON Crack - Data Flow Visualization

## Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                              │
├─────────────────────────────┬───────────────────────────────────────┤
│                             │                                       │
│    LEFT PANE                │         RIGHT PANE                    │
│    ┌─────────────────┐      │      ┌─────────────────────┐         │
│    │  TextEditor     │      │      │   LiveEditor        │         │
│    │  (Monaco)       │      │      │   ┌──────────────┐  │         │
│    │                 │      │      │   │  GraphView   │  │         │
│    │  {             │      │      │   │  ┌────────┐  │  │         │
│    │    "user": {   │      │      │   │  │ Node 1 │  │  │         │
│    │      "name":   │      │      │   │  └───┬────┘  │  │         │
│    │        "John"  │      │      │   │      │       │  │         │
│    │    }           │      │      │   │  ┌───▼────┐  │  │         │
│    │  }             │      │      │   │  │ Node 2 │  │  │         │
│    │                 │      │      │   │  └────────┘  │  │         │
│    └─────────────────┘      │      │   └──────────────┘  │         │
│            │                 │      │          │          │         │
│            │ onChange        │      │          │ onClick  │         │
│            ▼                 │      │          ▼          │         │
└────────────┼─────────────────┴──────┴──────────┼──────────┘         
             │                                    │                   
             │                                    │                   
┌────────────▼────────────────────────────────────▼──────────────────┐
│                      STATE MANAGEMENT (Zustand)                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐    │
│  │  useFile     │      │   useJson    │      │  useGraph    │    │
│  │              │      │              │      │              │    │
│  │ • contents   │─────▶│ • json       │─────▶│ • nodes      │    │
│  │ • format     │      │              │      │ • edges      │    │
│  │              │      │              │      │ • selected   │    │
│  └──────┬───────┘      └──────┬───────┘      └──────┬───────┘    │
│         │                     │                     │             │
│         │ setContents()       │ setJson()           │ setGraph()  │
│         │                     │                     │             │
└─────────┼─────────────────────┼─────────────────────┼─────────────┘
          │                     │                     │              
          ▼                     ▼                     ▼              
┌─────────────────────────────────────────────────────────────────┐
│                    PROCESSING LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐    ┌──────────────┐    ┌─────────────┐  │
│  │ contentToJson()  │───▶│  parser()    │───▶│ Render      │  │
│  │                  │    │              │    │ Components  │  │
│  │ • JSON           │    │ • Traverse   │    │             │  │
│  │ • YAML           │    │ • Create     │    │ • Canvas    │  │
│  │ • XML            │    │   nodes      │    │ • Nodes     │  │
│  │ • CSV            │    │ • Create     │    │ • Edges     │  │
│  │                  │    │   edges      │    │             │  │
│  └──────────────────┘    └──────────────┘    └─────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Edit Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER CLICKS NODE                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  CustomNode     │
                    │  onClick event  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ setSelectedNode │
                    │ (store node)    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  NodeModal      │
                    │  opens          │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
        ┌──────────────┐         ┌──────────────┐
        │ View Mode    │         │  Edit Mode   │
        │              │         │              │
        │ • Show JSON  │◀────────│ • Text Inputs│
        │ • Show Path  │  Cancel │ • Edit Keys  │
        │ • Edit Btn   │─────────▶ • Edit Values│
        └──────────────┘         └──────┬───────┘
                                        │
                                        │ Save
                                        ▼
                                ┌───────────────┐
                                │ handleSave()  │
                                └───────┬───────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
            ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
            │ Get JSON     │   │ Parse JSON   │   │ Navigate to  │
            │ from store   │──▶│ string       │──▶│ target path  │
            └──────────────┘   └──────────────┘   └──────┬───────┘
                                                          │
                                                          ▼
                                                  ┌──────────────┐
                                                  │ Update value │
                                                  │ Handle key   │
                                                  │ rename       │
                                                  └──────┬───────┘
                                                         │
                                                         ▼
                                                  ┌──────────────┐
                                                  │ Stringify    │
                                                  │ JSON         │
                                                  └──────┬───────┘
                                                         │
                                                         ▼
                                                  ┌──────────────┐
                                                  │ setJson()    │
                                                  └──────┬───────┘
                                                         │
                    ┌────────────────────────────────────┴────────┐
                    │                                             │
                    ▼                                             ▼
            ┌──────────────┐                              ┌──────────────┐
            │ Text Editor  │                              │ Graph View   │
            │ updates      │                              │ re-renders   │
            └──────────────┘                              └──────────────┘
```

## State Update Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ANY CHANGE TO JSON                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ useJson.setJson │
                    │ (json: string)  │
                    └────────┬────────┘
                             │
                             │ Automatically triggers
                             │
                             ▼
                    ┌─────────────────┐
                    │useGraph.setGraph│
                    │ (json: string)  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   parser()      │
                    │                 │
                    │ Converts JSON   │
                    │ to nodes/edges  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Store nodes &   │
                    │ edges in state  │
                    └────────┬────────┘
                             │
                             │ React re-renders
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
        ┌──────────────┐         ┌──────────────┐
        │ TextEditor   │         │  GraphView   │
        │ (Monaco)     │         │  (Canvas)    │
        │              │         │              │
        │ Shows new    │         │ Shows new    │
        │ JSON text    │         │ diagram      │
        └──────────────┘         └──────────────┘
```

## Node Data Structure

```
NodeData {
  id: "1"
  text: [
    {
      key: "name"           ← Property name
      value: "John"         ← Property value
      type: "string"        ← Data type
    },
    {
      key: "age"
      value: 30
      type: "number"
    }
  ]
  width: 150              ← Visual width
  height: 60              ← Visual height
  path: ["user"]          ← JSON path to this node
}
```

## Parser Logic Flow

```
JSON Input: { "user": { "name": "John", "age": 30 } }
                             │
                             ▼
                    ┌─────────────────┐
                    │  parseTree()    │
                    │  (jsonc-parser) │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  traverse()     │
                    │  (recursive)    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Create Node  │    │ Create Edge  │    │ Recurse into │
│              │    │              │    │ children     │
│ id: "1"      │    │ from: "1"    │    │              │
│ text: [...]  │    │ to: "2"      │    │ (repeat)     │
│ path: [...]  │    │ text: "user" │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
        │                    │                    │
        └────────────────────┴────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Return:         │
                    │ {               │
                    │   nodes: [...], │
                    │   edges: [...]  │
                    │ }               │
                    └─────────────────┘
```

## Component Hierarchy

```
EditorPage
├── Toolbar
├── StyledEditor (Allotment split pane)
│   ├── Left Pane
│   │   ├── TextEditor (Monaco)
│   │   └── BottomBar
│   └── Right Pane
│       └── LiveEditor
│           └── GraphView
│               ├── Canvas (Reaflow)
│               │   ├── CustomNode (many)
│               │   │   ├── ObjectNode
│               │   │   └── TextNode
│               │   └── CustomEdge (many)
│               ├── ZoomControl
│               └── OptionsMenu
└── ModalController
    └── NodeModal (when node clicked)
        ├── View Mode
        │   ├── CodeHighlight (content)
        │   └── CodeHighlight (path)
        └── Edit Mode
            ├── TextInput (keys)
            ├── TextInput (values)
            └── Buttons (Save/Cancel)
```

## Key Interactions

### 1. Type in Editor
```
User types → Monaco onChange → useFile.setContents() → 
contentToJson() → useJson.setJson() → useGraph.setGraph() → 
parser() → nodes/edges → GraphView re-renders
```

### 2. Click Node
```
User clicks → CustomNode onClick → useGraph.setSelectedNode() → 
useModal.setVisible("NodeModal") → NodeModal opens
```

### 3. Edit Node
```
User edits → handleSave() → Parse JSON → Navigate path → 
Update value → Stringify → useJson.setJson() → 
[triggers flow #1] → Both panes update
```

### 4. Format Change
```
User changes format → useFile.setFormat() → 
contentToJson(old format) → jsonToContent(new format) → 
useFile.setContents() → [triggers flow #1]
```

## Summary

The architecture is elegantly simple:
1. **Single source of truth**: JSON string in `useJson` store
2. **Automatic synchronization**: Changes to JSON trigger both panes
3. **Unidirectional flow**: Data flows down, events flow up
4. **Reactive updates**: Zustand + React handle all re-renders
5. **Type safety**: TypeScript ensures correctness throughout

The edit feature I built integrates seamlessly by:
- Reading from the same stores
- Writing back to the same stores
- Following the same data flow patterns
- Triggering the same update mechanisms
