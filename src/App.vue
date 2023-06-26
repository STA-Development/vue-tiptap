<template>
  <div class="drag-tiptap-editor">
    <div class="editor-container">
      <editor-content :editor="editor" ref="editorContent" />
      <div class="dropped-items">
        <template v-for="(item, index) in droppedItems" :key="index">
          <editor-content
            :content="item"
            @dragstart="onDragStart(item)"
            draggable="true"
          />
        </template>
      </div>
    </div>
    <div class="toolbar">
      <button @click="toggleBulletList" :class="{ active: isBulletListActive }">
        Bullet List
      </button>
    </div>
  </div>
</template>

<script>
import { Editor, EditorContent } from "@tiptap/vue-3";
import { StarterKit } from "@tiptap/starter-kit";
import { BulletList } from "@tiptap/extension-bullet-list";

export default {
  components: {
    EditorContent,
  },
  data() {
    return {
      editor: null,
      isBulletListActive: false,
      droppedItems: [],
      dragData: null,
    };
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit,
        BulletList.configure({
          HTMLAttributes: {
            class: "bullet-list",
          },
        }),
      ],
    });
    this.editor.commands.setContent(this.initialContent());

    // Add the drop event listener to the editor's content element
    this.$nextTick(() => {
      this.$refs.editorContent.$el.addEventListener(
        "dragstart",
        this.onDragStart
      );
      this.$refs.editorContent.$el.addEventListener("drop", this.onDrop);
    });
  },

  beforeUnmount() {
    // Remove the drop event listener when the component is unmounted
    this.$nextTick(() => {
      this.$refs.editorContent.$el.removeEventListener("drag", this.onDrop);
    });
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

    toggleBulletList() {
      this.editor.chain().toggleBulletList().run();
      this.isBulletListActive = this.editor.isActive("bulletList");
    },

    onDrop(event) {
      console.log(event);
      event.preventDefault();
      const coordinates = this.editor.view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      });

      console.log(this.dragData, 3333);

      if (this.dragData) {
        const droppedItem = this.dragData;
        console.log(droppedItem);
        this.droppedItems.push(droppedItem);
        this.editor.commands.insertContentAt(coordinates.pos, droppedItem);
      }
    },

    onDragStart(item) {
      console.log("1111");
      this.dragData = item;
    },
  },
};
</script>

<style>
.drag-tiptap-editor {
  display: flex;
}

.editor-container {
  flex: 1;
  border: 1px solid #ccc;
  padding: 10px;
  position: relative; /* Add this line to position the container */
}

.dropped-items {
  margin-top: 10px;
}

.toolbar {
  padding: 10px;
}

.button {
  margin-right: 10px;
}

.bullet-list {
  list-style-type: disc;
  margin-left: 20px;
}

.ProseMirror > * {
  padding: 20px;
}

/* Add drag icon */
.editor-container .ProseMirror p::before {
  content: "⇄";
  display: none;
  position: absolute;
  left: -1.2em;
  pointer-events: none; /* Add this line to allow pointer events to pass through */
}

.editor-container .ProseMirror p:hover::before {
  display: inline-block;
}

.editor-container .ProseMirror p:empty::before {
  content: "";
}
</style>
