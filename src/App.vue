<template>
  <div class="drag-tiptap-editor">
    <div ref="editorContainer" class="editor-container">
      <EditorContent :editor="editor" />
      {{ console.log(draggableItems) }}

      <div
        v-for="(node, index) in draggableItems"
        :key="index"
        class="draggable-item"
        v-draggable-item
      >
        {{ draggableItems }}
        <editor-content :content="node" />
      </div>
    </div>
  </div>
</template>

<script>
import { Node, Editor, EditorContent } from "@tiptap/vue-3";
import Draggable from "vuedraggable";
import { StarterKit } from "@tiptap/starter-kit";

export default {
  components: {
    EditorContent,
  },
  data() {
    return (
      {
        schema: {
          topNode: "doc",
          nodes: {
            doc: {
              content: "block+",
            },
            // Define other node types as needed
          },
        },
        editor: null,
        draggableItems: {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Draggable Element 1",
            },
          ],
        },
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Draggable Element 2",
          },
        ],
      }
    );
  },

  mounted() {
    this.editor = new Editor({
      extensions: [StarterKit],
    });
    console.log(this.editor);
    this.editor.commands.setContent(this.initialContent());
    console.log(this.editor, 24242);
    this.draggableItems = Node.create();
    this.initializeDraggable();
  },
  methods: {
    initialContent() {
      return {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Drag and drop these elements within the editor:",
              },
            ],
          },
        ],
      };
    },
    initializeDraggable() {
      const self = this;
      Draggable.create(".draggable-item", {
        onDragStart() {
          const index = Array.from(this.target.parentNode.children).indexOf(
            this.target
          );
          const draggedItem = self.draggableItems.splice(index, 1)[0];
          this.dataTransfer.setData("text/plain", JSON.stringify(draggedItem));
        },
        onDragEnd() {
          self.editor.commands.setContent(self.initialContent());
          self.initializeDraggable();
        },
      });
    },
  },
  directives: {
    draggableItem: {
      inserted(el) {
        el.setAttribute("draggable", true);
      },
    },
  },
};
</script>

<style scoped>
.drag-tiptap-editor {
  border: 1px solid #ccc;
  padding: 10px;
}

.editor-container {
  min-height: 200px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
}

.draggable-item {
  cursor: move;
  margin-bottom: 10px;
}
</style>
