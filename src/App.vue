<template>
  <div class="col mx-2 px-2 py-3 bg-light border rounded">
    <h6>Todo ✍</h6>
    <h1>sfasfasfas</h1>
    <draggable
      class="draggable-list"
      :options="dragOptions"
      :list="tasks.todos"
      group="tasks"
    >
      <template #item="aaaaa">
        <div>
          {{ console.log(aaaaa) }}
          <div>{{ aaaaa.index }}</div>

          <div>2</div>
        </div>
      </template>
    </draggable>
  </div>
  <div class="col mx-2 px-2 py-3 bg-light border rounded">
    <draggable
      v-if="content[0]"
      class="draggable-list"
      :list="content"
      group="tasks"
    >
      <template #item="singleItem">
        <div :key="uuidv4()()" style="position: relative">
          <div
            class="drag-options"
            style="
              position: absolute;
              left: -5px;
              top: -50px;
              width: 40px;
              height: 40px;
              background: red;
            "
          ></div>
          <editor-content :editor="singleItem.element" />
        </div>
      </template>
    </draggable>
  </div>
  <!--    </div>-->
  <!--  </div>-->
</template>

<script>
import StarterKit from "@tiptap/starter-kit";
import { Editor, EditorContent } from "@tiptap/vue-3";
import draggable from "vuedraggable";
import { v4 as uuidv4 } from "uuid";
export default {
  methods: {
    uuidv4() {
      return uuidv4;
    },
  },
  components: {
    draggable,
    EditorContent,
  },
  mounted() {
    this.content = this.content.map(
      () =>
        new Editor({
          extensions: [StarterKit],
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
      `,
        })
    );
    console.log(this.content, 111);
  },
  data() {
    return {
      eachTipTap: { content: "aaa" },
      // extensions: [new Bold(), new Italic()],
      content: [null, null],
      tasks: {
        ideas: ["Migrate codebase to TypeScript"],
        todos: ["Dockerize App", "Add vue.draggable to project"],
        inProgress: ["Implement Web3 Features", "Bump to vite.js"],
        completed: [],
      },
      dragOptions: {
        handle: ".drag-handle", // CSS class for the handle element

        animation: 200,
      },
    };
  },
};
</script>

<style scoped>
h6 {
  font-weight: 700;
}
.col {
  height: 90vh;
  overflow: auto;
}
.draggable-list > div {
  cursor: pointer;
}
</style>
