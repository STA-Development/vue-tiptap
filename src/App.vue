<template>
  <div class="drag-tiptap-editor">
    <div class="editor-container">
      <editor-content :editor="editor" ref="editorContent" />
      <div class="dropped-items">
        <template v-for="(item, index) in droppedItems" :key="index">
          <div class="drag-row">
            <editor-content
              :content="item"
              @dragstart="onDragStart(item)"
              draggable="true"
            />
            <button class="drag-button" @drag="onDrag" draggable="true">
              Drag
            </button>
          </div>
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
import DraggableItem from "./components/Extensions/DraggableItem.ts";

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
        DraggableItem,
      ],
      editorProps: {
        handleDOMEvents: {
          drop: (view, e) => {
            e.preventDefault();
          },
        },
      },
      // hide the drop position indicator
      dropCursor: { width: 0, color: "transparent" },
      onPaste(view, { type }, slice, moved = false) {
        // moved is unset on paste events so the fallback of false is used

        // skip paste events
        if (type === "paste") return false;

        return !moved;
      },
      content: ` <p data-type="draggable-item">This is a boring paragraph.</p>
        <div >

          <p class="drag-handle">Followed by a fancy draggable item.</p>
        </div>
        <div data-type="draggable-item">
          <p data-type="draggable-item">And another draggable item.</p>
          <div data-type="draggable-item">
            <p data-type="draggable-item">And a nested one.</p>
            <div data-type="draggable-item">
              <p data-type="draggable-item">But can we go deeper?</p>
            </div>
          </div>
        </div>
        <p>Let’s finish with a boring paragraph.</p>`,
    });
    // this.editor.commands.setContent(this.initialContent());

    // Add the drop and dragover event listeners to the editor's content element
    this.$nextTick(() => {
      const editorContentEl = this.$refs.editorContent.$el;

      editorContentEl.addEventListener("dragstart", this.onDragStart);
      editorContentEl.addEventListener("drop", this.onDrop);
      editorContentEl.addEventListener("dragover", this.onDragOver);
    });
  },

  beforeUnmount() {
    // Remove the event listeners when the component is unmounted
    this.$nextTick(() => {
      const editorContentEl = this.$refs.editorContent.$el;

      editorContentEl.removeEventListener("dragstart", this.onDragStart);
      editorContentEl.removeEventListener("drop", this.onDrop);
      editorContentEl.removeEventListener("onMouseUp", this.onDrop);
      editorContentEl.removeEventListener("dragover", this.onDragOver);
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
      event.preventDefault();
      event.stopPropagation();

      event.returnValue = false;

      const coordinates = this.editor.view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      });

      console.log(this.editor);

      console.log(this.dragData);
      if (this.dragData) {
        const droppedItem = this.dragData;
        this.droppedItems.push(droppedItem);
        console.log(droppedItem);
        this.editor.commands.insertContentAt(coordinates.pos, droppedItem);
      }
      return null;
    },

    onDragStart(event) {
      console.log(event);
      this.dragData = event.target.innerHTML ?? event.target.textContent;
    },

    onDrag(event) {
      console.log(event);
      // Call the onDrag function when the "Drag" button is dragged
      console.log("Drag button is being dragged");
    },

    onDragOver(event) {
      console.log(event);
      event.preventDefault(); // Prevent the default drop functionality
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

.drag-row {
  display: flex;
  align-items: center;
}

.drag-button {
  margin-left: 5px;
  color: #000; /* Add your desired color */
  background-color: #f0f0f0; /* Add your desired background color */
  padding: 5px 10px; /* Add your desired padding */
  border-radius: 4px; /* Add your desired border radius */
  cursor: move;
}
</style>
