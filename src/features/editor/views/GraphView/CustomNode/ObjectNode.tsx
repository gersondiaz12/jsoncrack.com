import React from "react";
import toast from "react-hot-toast";
import type { CustomNodeProps } from ".";
import { NODE_DIMENSIONS } from "../../../../../constants/graph";
import useJson from "../../../../../store/useJson";
import useFile from "../../../../../store/useFile";
import useGraph from "../stores/useGraph";
import type { NodeData } from "../../../../../types/graph";
import { TextRenderer } from "./TextRenderer";
import * as Styled from "./styles";

type RowProps = {
  row: NodeData["text"][number];
  x: number;
  y: number;
  index: number;
  nodePath: NodeData["path"];
  isEditing: boolean;
  onEdit: () => void;
};

const Row = ({ row, x, y, index, nodePath, isEditing, onEdit }: RowProps) => {
  const rowPosition = index * NODE_DIMENSIONS.ROW_HEIGHT;
  const [editedKey, setEditedKey] = React.useState(row.key || "");
  const [editedValue, setEditedValue] = React.useState(String(row.value ?? ""));
  const getJson = useJson(state => state.getJson);

  const getRowText = () => {
    if (row.type === "object") return `{${row.childrenCount ?? 0} keys}`;
    if (row.type === "array") return `[${row.childrenCount ?? 0} items]`;
    return row.value;
  };

  const handleSave = () => {
    console.log("[ObjectNode Row] handleSave called!");
    console.log("[ObjectNode Row] editedKey:", editedKey, "editedValue:", editedValue);

    try {
      const currentJson = getJson();
      console.log("[ObjectNode Row] Current JSON:", currentJson);

      const parsedJson = JSON.parse(currentJson);
      const path = nodePath || [];

      let target: any = parsedJson;
      for (let i = 0; i < path.length - 1; i++) {
        target = target[path[i]];
      }

      const lastKey = path[path.length - 1];
      const targetObj = lastKey !== undefined ? target[lastKey] : target;

      const parseValue = (value: any, type: string) => {
        if (type === "number") return Number(value);
        if (type === "boolean") return value === "true" || value === true;
        if (type === "null") return null;
        return value;
      };

      if (row.key && row.key !== editedKey) {
        delete targetObj[row.key];
        targetObj[editedKey] = parseValue(editedValue, row.type);
      } else if (row.key) {
        targetObj[editedKey] = parseValue(editedValue, row.type);
      }

      const updatedJson = JSON.stringify(parsedJson, null, 2);

      console.log("[ObjectNode Row] Saving:", updatedJson);

      // Update BOTH stores
      useJson.setState({ json: updatedJson, loading: false });
      useFile.setState({ contents: updatedJson, hasChanges: true });

      // Trigger graph update
      useGraph.getState().setGraph(updatedJson);

      console.log("[ObjectNode Row] After update - useJson:", useJson.getState().json);
      console.log("[ObjectNode Row] After update - useFile:", useFile.getState().contents);

      toast.success("Updated successfully!");
      onEdit();
    } catch (error) {
      console.error("[ObjectNode Row] Error:", error);
      toast.error("Failed to update: " + (error as Error).message);
    }
  };

  const canEdit = row.type !== "array" && row.type !== "object";

  console.log("[ObjectNode Row] Render - isEditing:", isEditing, "canEdit:", canEdit);

  if (isEditing && canEdit) {
    return (
      <Styled.StyledEditRow
        data-x={x}
        data-y={y + rowPosition}
        onMouseDown={e => e.stopPropagation()}
        onMouseMove={e => e.stopPropagation()}
      >
        {row.key !== null && (
          <Styled.StyledEditInput
            value={editedKey}
            onChange={e => {
              console.log("[ObjectNode Row] Key changed:", e.target.value);
              setEditedKey(e.target.value);
            }}
            onClick={e => {
              e.stopPropagation();
              const target = e.currentTarget;
              setTimeout(() => target.select(), 0);
            }}
            onMouseDown={e => e.stopPropagation()}
            placeholder="key"
          />
        )}
        <Styled.StyledEditInput
          value={editedValue}
          onChange={e => {
            console.log("[ObjectNode Row] Value changed:", e.target.value);
            setEditedValue(e.target.value);
          }}
          onClick={e => {
            e.stopPropagation();
            const target = e.currentTarget;
            setTimeout(() => target.select(), 0);
          }}
          onMouseDown={e => e.stopPropagation()}
          placeholder="value"
          autoFocus
        />
        <Styled.StyledEditButton
          onClick={() => {
            console.log("[ObjectNode Row] Save button clicked!");
            handleSave();
          }}
          onMouseDown={e => e.stopPropagation()}
        >
          ✓
        </Styled.StyledEditButton>
        <Styled.StyledEditButton
          onClick={() => {
            console.log("[ObjectNode Row] Cancel button clicked!");
            setEditedKey(row.key || "");
            setEditedValue(String(row.value ?? ""));
            onEdit();
          }}
          onMouseDown={e => e.stopPropagation()}
        >
          ✕
        </Styled.StyledEditButton>
      </Styled.StyledEditRow>
    );
  }

  return (
    <Styled.StyledRow
      $value={row.value}
      data-key={`${row.key}: ${row.value}`}
      data-x={x}
      data-y={y + rowPosition}
    >
      <Styled.StyledKey $type="object">{row.key}: </Styled.StyledKey>
      <TextRenderer>{getRowText()}</TextRenderer>
    </Styled.StyledRow>
  );
};

const Node = ({ node, x, y }: CustomNodeProps) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [hovering, setHovering] = React.useState(false);
  const canEdit = node.text.some(row => row.type !== "array" && row.type !== "object");

  console.log("[ObjectNode] Render - isEditing:", isEditing, "hovering:", hovering, "canEdit:", canEdit);

  return (
    <Styled.StyledForeignObject
      data-id={`node-${node.id}`}
      width={node.width}
      height={node.height}
      x={0}
      y={0}
      $isObject
      onMouseEnter={() => {
        console.log("[ObjectNode] Mouse enter");
        setHovering(true);
      }}
      onMouseLeave={() => {
        console.log("[ObjectNode] Mouse leave");
        setHovering(false);
      }}
    >
      {canEdit && hovering && !isEditing && (
        <Styled.StyledEditButtonOverlay
          onClick={() => {
            console.log("[ObjectNode] Edit button clicked!");
            setIsEditing(true);
          }}
        >
          ✎ Edit
        </Styled.StyledEditButtonOverlay>
      )}
      {node.text.map((row, index) => (
        <Row
          key={`${node.id}-${index}`}
          row={row}
          x={x}
          y={y}
          index={index}
          nodePath={node.path}
          isEditing={isEditing}
          onEdit={() => setIsEditing(false)}
        />
      ))}
    </Styled.StyledForeignObject>
  );
};

function propsAreEqual(prev: CustomNodeProps, next: CustomNodeProps) {
  return (
    JSON.stringify(prev.node.text) === JSON.stringify(next.node.text) &&
    prev.node.width === next.node.width
  );
}

export const ObjectNode = React.memo(Node, propsAreEqual);
