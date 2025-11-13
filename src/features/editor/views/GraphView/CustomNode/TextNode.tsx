import React from "react";
import styled from "styled-components";
import toast from "react-hot-toast";
import type { CustomNodeProps } from ".";
import useConfig from "../../../../../store/useConfig";
import useJson from "../../../../../store/useJson";
import useFile from "../../../../../store/useFile";
import useGraph from "../stores/useGraph";
import { isContentImage } from "../lib/utils/calculateNodeSize";
import { TextRenderer } from "./TextRenderer";
import * as Styled from "./styles";

const StyledTextNodeWrapper = styled.span<{ $isParent: boolean }>`
  display: flex;
  justify-content: ${({ $isParent }) => ($isParent ? "center" : "flex-start")};
  align-items: center;
  height: 100%;
  width: 100%;
  overflow: hidden;
  padding: 0 10px;
  position: relative;
`;

const StyledImageWrapper = styled.div`
  padding: 5px;
`;

const StyledImage = styled.img`
  border-radius: 2px;
  object-fit: contain;
  background: ${({ theme }) => theme.BACKGROUND_MODIFIER_ACCENT};
`;

const Node = ({ node, x, y }: CustomNodeProps) => {
  const { text, width, height, path } = node;
  const imagePreviewEnabled = useConfig(state => state.imagePreviewEnabled);
  const isImage = imagePreviewEnabled && isContentImage(JSON.stringify(text[0].value));
  const value = text[0].value;
  const [isEditing, setIsEditing] = React.useState(false);
  const [hovering, setHovering] = React.useState(false);
  const [editedValue, setEditedValue] = React.useState(String(value ?? ""));
  const getJson = useJson(state => state.getJson);

  const handleSave = () => {
    console.log("[TextNode] handleSave called! editedValue:", editedValue);

    try {
      const currentJson = getJson();
      console.log("[TextNode] Current JSON:", currentJson);

      const parsedJson = JSON.parse(currentJson);
      const nodePath = path || [];

      const parseValue = (val: any, type: string) => {
        if (type === "number") return Number(val);
        if (type === "boolean") return val === "true" || val === true;
        if (type === "null") return null;
        return val;
      };

      let updatedJson: string;
      if (nodePath.length === 0) {
        updatedJson = JSON.stringify(parseValue(editedValue, text[0].type), null, 2);
      } else {
        let target: any = parsedJson;
        for (let i = 0; i < nodePath.length - 1; i++) {
          target = target[nodePath[i]];
        }
        const lastKey = nodePath[nodePath.length - 1];
        target[lastKey] = parseValue(editedValue, text[0].type);
        updatedJson = JSON.stringify(parsedJson, null, 2);
      }

      console.log("[TextNode] Saving:", updatedJson);

      // Update BOTH stores
      useJson.setState({ json: updatedJson, loading: false });
      useFile.setState({ contents: updatedJson, hasChanges: true });

      // Trigger graph update
      useGraph.getState().setGraph(updatedJson);

      console.log("[TextNode] After update - useJson:", useJson.getState().json);
      console.log("[TextNode] After update - useFile:", useFile.getState().contents);

      toast.success("Updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("[TextNode] Error:", error);
      toast.error("Failed to update: " + (error as Error).message);
    }
  };

  const canEdit = text[0].type !== "array" && text[0].type !== "object";

  return (
    <Styled.StyledForeignObject
      data-id={`node-${node.id}`}
      width={width}
      height={height}
      x={0}
      y={0}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {isImage ? (
        <StyledImageWrapper>
          <StyledImage src={JSON.stringify(text[0].value)} width="70" height="70" loading="lazy" />
        </StyledImageWrapper>
      ) : isEditing ? (
        <Styled.StyledEditRow
          data-x={x}
          data-y={y}
          onMouseDown={e => e.stopPropagation()}
          onMouseMove={e => e.stopPropagation()}
        >
          <Styled.StyledEditInput
            value={editedValue}
            onChange={e => setEditedValue(e.target.value)}
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
            onClick={handleSave}
            onMouseDown={e => e.stopPropagation()}
          >
            ✓
          </Styled.StyledEditButton>
          <Styled.StyledEditButton
            onClick={() => {
              setEditedValue(String(value ?? ""));
              setIsEditing(false);
            }}
            onMouseDown={e => e.stopPropagation()}
          >
            ✕
          </Styled.StyledEditButton>
        </Styled.StyledEditRow>
      ) : (
        <StyledTextNodeWrapper
          data-x={x}
          data-y={y}
          data-key={JSON.stringify(text)}
          $isParent={false}
        >
          {canEdit && hovering && (
            <Styled.StyledEditButtonOverlay onClick={() => setIsEditing(true)}>
              ✎
            </Styled.StyledEditButtonOverlay>
          )}
          <Styled.StyledKey $value={value} $type={typeof text[0].value}>
            <TextRenderer>{value}</TextRenderer>
          </Styled.StyledKey>
        </StyledTextNodeWrapper>
      )}
    </Styled.StyledForeignObject>
  );
};

function propsAreEqual(prev: CustomNodeProps, next: CustomNodeProps) {
  return prev.node.text === next.node.text && prev.node.width === next.node.width;
}

export const TextNode = React.memo(Node, propsAreEqual);
