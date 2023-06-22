<template>
  <div v-if="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import StarterKit from "@tiptap/starter-kit";
import { Editor, EditorContent } from "@tiptap/vue-3";

import DraggableItem from "./components/Extensions/DraggableItem.ts";

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
    };
  },

  mounted() {
    this.editor = new Editor({
      extensions: [StarterKit, DraggableItem],
      content: `
        <p>This is a boring paragraph.</p>
        <div data-type="draggable-item">
          <p>Followed by a fancy draggable item.</p>
        </div>
        <div data-type="draggable-item">
          <p>And another draggable item.</p>
          <div data-type="draggable-item">
            <p>And a nested one.</p>
            <div data-type="draggable-item">
              <p>But can we go deeper?</p>
            </div>
          </div>
        </div>
        <p>Let’s finish with a boring paragraph.</p>
        <div data-type="draggable-item">
          <ul data-type="draggable-item">

            <li class="drag-handle" data-type="draggable-item" data-drag-handle>Something2</li>

            <li class="drag-handle" data-type="draggable-item" data-drag-handle>Something3</li>

            <li class="drag-handle" data-type="draggable-item" data-drag-handle>Something4</li>
          </ul>
        </div>
      `,
    });
  },

  beforeUnmount() {
    this.editor.destroy();
  },
};
</script>
