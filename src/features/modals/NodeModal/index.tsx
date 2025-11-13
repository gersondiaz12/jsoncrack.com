import React from "react";
import type { ModalProps } from "@mantine/core";
import { Modal, Stack, Text, ScrollArea, Flex, CloseButton, Button, TextInput, Group } from "@mantine/core";
import { CodeHighlight } from "@mantine/code-highlight";
import toast from "react-hot-toast";
import type { NodeData } from "../../../types/graph";
import useGraph from "../../editor/views/GraphView/stores/useGraph";
import useJson from "../../../store/useJson";

// return object from json removing array and object fields
const normalizeNodeData = (nodeRows: NodeData["text"]) => {
  if (!nodeRows || nodeRows.length === 0) return "{}";
  if (nodeRows.length === 1 && !nodeRows[0].key) return `${nodeRows[0].value}`;

  const obj = {};
  nodeRows?.forEach(row => {
    if (row.type !== "array" && row.type !== "object") {
      if (row.key) obj[row.key] = row.value;
    }
  });
  return JSON.stringify(obj, null, 2);
};

// return json path in the format $["customer"]
const jsonPathToString = (path?: NodeData["path"]) => {
  if (!path || path.length === 0) return "$";
  const segments = path.map(seg => (typeof seg === "number" ? seg : `"${seg}"`));
  return `$[${segments.join("][")}]`;
};

export const NodeModal = ({ opened, onClose }: ModalProps) => {
  const nodeData = useGraph(state => state.selectedNode);
  const setJson = useJson(state => state.setJson);
  const getJson = useJson(state => state.getJson);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedRows, setEditedRows] = React.useState<NodeData["text"]>([]);

  React.useEffect(() => {
    if (nodeData?.text) {
      setEditedRows(JSON.parse(JSON.stringify(nodeData.text)));
    }
    setIsEditing(false);
  }, [nodeData]);

  const handleSave = () => {
    try {
      const currentJson = getJson();
      const parsedJson = JSON.parse(currentJson);
      const path = nodeData?.path || [];
      const originalRows = nodeData?.text || [];

      // Navigate to the target location in the JSON
      let target: any = parsedJson;
      for (let i = 0; i < path.length - 1; i++) {
        target = target[path[i]];
      }

      // Update the value(s)
      if (editedRows.length === 1 && !editedRows[0].key) {
        // Single value node
        const lastKey = path[path.length - 1];
        if (lastKey !== undefined) {
          target[lastKey] = parseValue(editedRows[0].value, editedRows[0].type);
        } else {
          // Root level value
          setJson(JSON.stringify(parseValue(editedRows[0].value, editedRows[0].type), null, 2));
          setIsEditing(false);
          toast.success("Node updated successfully!");
          return;
        }
      } else {
        // Object with multiple properties
        const lastKey = path[path.length - 1];
        const targetObj = lastKey !== undefined ? target[lastKey] : target;

        // Handle key renames and value updates
        editedRows.forEach((row, index) => {
          if (row.type === "array" || row.type === "object") return;

          const originalKey = originalRows[index]?.key;
          const newKey = row.key;

          if (originalKey && newKey && originalKey !== newKey) {
            // Key was renamed - delete old key and add new one
            const value = parseValue(row.value, row.type);
            delete targetObj[originalKey];
            targetObj[newKey] = value;
          } else if (row.key) {
            // Just update the value
            targetObj[row.key] = parseValue(row.value, row.type);
          }
        });
      }

      setJson(JSON.stringify(parsedJson, null, 2));
      setIsEditing(false);
      toast.success("Node updated successfully!");
    } catch (error) {
      toast.error("Failed to update node: " + (error as Error).message);
    }
  };

  const parseValue = (value: any, type: string) => {
    if (type === "number") return Number(value);
    if (type === "boolean") return value === "true" || value === true;
    if (type === "null") return null;
    return value;
  };

  const handleRowChange = (index: number, field: "key" | "value", newValue: string) => {
    const updated = [...editedRows];
    updated[index] = { ...updated[index], [field]: newValue };
    setEditedRows(updated);
  };

  const canEdit = nodeData?.text.some(row => row.type !== "array" && row.type !== "object");

  return (
    <Modal size="auto" opened={opened} onClose={onClose} centered withCloseButton={false}>
      <Stack pb="sm" gap="sm">
        <Stack gap="xs">
          <Flex justify="space-between" align="center">
            <Text fz="xs" fw={500}>
              Content
            </Text>
            <Flex gap="xs">
              {canEdit && !isEditing && (
                <Button size="xs" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
              <CloseButton onClick={onClose} />
            </Flex>
          </Flex>
          {isEditing ? (
            <Stack gap="sm" miw={350} maw={600}>
              {editedRows.map((row, index) => {
                if (row.type === "array" || row.type === "object") return null;
                return (
                  <Group key={index} gap="xs" align="flex-end" wrap="nowrap">
                    {row.key !== null && (
                      <TextInput
                        size="xs"
                        label="Key"
                        value={row.key}
                        onChange={e => handleRowChange(index, "key", e.target.value)}
                        style={{ flex: 1, minWidth: 0 }}
                        placeholder="Property name"
                      />
                    )}
                    <TextInput
                      size="xs"
                      label={row.key !== null ? "Value" : "Content"}
                      value={String(row.value ?? "")}
                      onChange={e => handleRowChange(index, "value", e.target.value)}
                      style={{ flex: 1, minWidth: 0 }}
                      placeholder={`Enter ${row.type} value`}
                      description={row.type !== "string" ? `Type: ${row.type}` : undefined}
                    />
                  </Group>
                );
              })}
              <Group gap="xs" mt="xs">
                <Button size="xs" onClick={handleSave} color="blue">
                  Save Changes
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  color="gray"
                  onClick={() => {
                    setEditedRows(JSON.parse(JSON.stringify(nodeData?.text || [])));
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </Group>
            </Stack>
          ) : (
            <ScrollArea.Autosize mah={250} maw={600}>
              <CodeHighlight
                code={normalizeNodeData(nodeData?.text ?? [])}
                miw={350}
                maw={600}
                language="json"
                withCopyButton
              />
            </ScrollArea.Autosize>
          )}
        </Stack>
        <Text fz="xs" fw={500}>
          JSON Path
        </Text>
        <ScrollArea.Autosize maw={600}>
          <CodeHighlight
            code={jsonPathToString(nodeData?.path)}
            miw={350}
            mah={250}
            language="json"
            copyLabel="Copy to clipboard"
            copiedLabel="Copied to clipboard"
            withCopyButton
          />
        </ScrollArea.Autosize>
      </Stack>
    </Modal>
  );
};
