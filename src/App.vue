<template>
  <div class="drag-tiptap-editor">
    <div class="editor-container">
      <editor-content :editor="editor" ref="editorContent" />
      <div class="dropped-items">
        <template v-for="(item, index) in droppedItems" :key="index">
          <editor-content :content="item" />
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
import {
  absoluteRect,
  dom,
  removeNode,
  serializeForClipboard,
} from "./lib/utils/dom.js";
import { NodeSelection, PluginKey } from "prosemirror-state";

import { Plugin } from "@tiptap/pm/state";
import { Extension, mergeAttributes } from "@tiptap/core";
import { Paragraph } from "@tiptap/extension-paragraph";
import { EditorView } from "prosemirror-view";

const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      draggable: "true",
      class: {
        default: "noteDragHandle",
        // Take the attribute values
        renderHTML: (attributes) => {
          // … and return an object with HTML attributes.
          return {
            draggable: "true",
            class: `${attributes.class}`,
          };
        },
      },
    };
  },
});
const CustomExtension = Extension.create({
  get name() {
    return "CustomExtension";
  },
  onCreate() {
    const brokenClipboardAPI = false;

    function blockPosAtCoords(coords, view) {
      let pos = view.posAtCoords(coords);
      let node = view.domAtPos(pos.pos);

      node = node.node;
      while (node && node.parentNode) {
        if (node.parentNode.classList.contains("ProseMirror")) {
          break;
        }
        node = node.parentNode;
      }

      if (node && node.nodeType === 1) {
        let desc = view.docView.nearestDesc(node, true);
        if (!(!desc || desc === view.docView)) {
          return desc.posBefore;
        }
      }
      return null;
    }

    function dragStart(e, view) {
      if (!e.dataTransfer) return;

      let coords = { left: e.clientX + 50, top: e.clientY };
      let pos = blockPosAtCoords(coords, view);
      if (pos != null) {
        view.dispatch(
          view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos))
        );

        let slice = view.state.selection.content();
        let { dom, text } = serializeForClipboard(view, slice);

        e.dataTransfer.clearData();
        e.dataTransfer.setData(
          brokenClipboardAPI ? "Text" : "text/html",
          dom.innerHTML
        );
        if (!brokenClipboardAPI) e.dataTransfer.setData("text/plain", text);

        view.dragging = { slice, move: true };
      }
    }

    let dropElement;
    const WIDTH = 24;

    return [
      new Plugin({
        key: new PluginKey("newPlugin"),

        view(editorView) {
          console.log(81924781927489);
          dropElement = dom(
            "p",
            {
              draggable: "true",
              class: "noteDragHandle",
              ondragstart: (e) => dragStart(e, editorView),
            },
            ["⠿"]
          );
          console.log("1111");
          document.body.appendChild(dropElement);
          return {
            update(view, prevState) {},
            destroy() {
              removeNode(dropElement);
              dropElement = null;
            },
          };
        },
        props: {
          drop(view, event) {
            console.log("$!$$!$!");
            setTimeout(() => {
              let node = document.querySelector(".ProseMirror-hideselection");
              if (node) {
                node.classList.remove("ProseMirror-hideselection");
              }
            }, 50);
          },
          mousemove(view, event) {
            let coords = {
              left: event.clientX + WIDTH + 10,
              top: event.clientY,
            };
            let pos = view.posAtCoords(coords);
            let node = view.domAtPos(pos.pos);

            node = node.node;
            while (node && node.parentNode) {
              if (node.parentNode.classList.contains("ProseMirror")) {
                break;
              }
              node = node.parentNode;
            }

            let rect = absoluteRect(node);
            let win = node.ownerDocument.defaultView;
            rect.top += win.pageYOffset;
            rect.left += win.pageXOffset;
            rect.width = WIDTH + "px";

            dropElement.style.left = -WIDTH + rect.left + "px";
            dropElement.style.top = rect.top + "px";
          },
        },
      }),
    ];
  },
});

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
      dragEvent: null,
    };
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        BulletList.configure({
          HTMLAttributes: {
            class: "bullet-list",
          },
        }),
        CustomExtension,
        CustomParagraph,
        StarterKit.configure({
          heading: false,
        }),
      ],

      content: `
        <ul><li>
        <p>This is a boring paragraph.</p>
</li><li>
        <p>This is a boring paragraph2</p>
</li><li>
        <p>This is a boring paragrap3.</p>
</li></ul>
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
      `,
    });

    const plugin = this.editor.state;

    console.log(plugin);
    this.editor.commands.updateAttributes("paragraph", {
      draggable: "true",
    });
    const editorContentEl = this.$refs.editorContent.$el;

    console.log(this.editor);
    // this.editor.commands.setContent(this.initialContent());

    // Add the drop event listener to the editor's content element
    this.$nextTick(() => {
      console.log(this.$refs);
      editorContentEl.addEventListener("dragstart", this.onDragStart);
    });
    this.$nextTick(() => {
      editorContentEl.addEventListener("drop", this.onDrop);
    });
  },

  beforeUnmount() {
    // Remove the drop event listener when the component is unmounted
    this.$nextTick(() => {
      this.$refs.editorContent.$el.removeEventListener("drop", this.onDrop);
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
    onDragStart(event) {
      console.log(event);
      console.log(11124124124124);
      this.dragEvent = event.target;
      this.dragData = event.target.innerHTML ?? event.target.textContent;
    },
    toggleBulletList() {
      console.log(this.editor.chain());
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
        this.dragEvent.remove();
        this.dragEvent = null;
      }
      return null;
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
</style>
