import { DOMSerializer } from "prosemirror-model";

export function createRect(rect) {
  if (rect == null) {
    return null;
  }
  let newRect = {
    left: rect.left + document.body.scrollLeft,
    top: rect.top + document.body.scrollTop,
    width: rect.width,
    height: rect.height,
    bottom: 0,
    right: 0,
  };
  newRect.bottom = newRect.top + newRect.height;
  newRect.right = newRect.left + newRect.width;
  return newRect;
}

export const absoluteRect = (element) => {
  return createRect(element.getBoundingClientRect());
};

const wrapMap = {
  thead: ["table"],
  tbody: ["table"],
  tfoot: ["table"],
  caption: ["table"],
  colgroup: ["table"],
  col: ["table", "colgroup"],
  tr: ["table", "tbody"],
  td: ["table", "tbody", "tr"],
  th: ["table", "tbody", "tr"],
};

export function serializeForClipboard(view, slice) {
  view.someProp("transformCopied", (f) => {
    slice = f(slice, view);
  });

  let context = [],
    { content, openStart, openEnd } = slice;
  while (
    openStart > 1 &&
    openEnd > 1 &&
    content.childCount == 1 &&
    content.firstChild.childCount == 1
  ) {
    openStart--;
    openEnd--;
    let node = content.firstChild;
    context.push(
      node.type.name,
      node.attrs != node.type.defaultAttrs ? node.attrs : null
    );
    content = node.content;
  }

  let serializer =
    view.someProp("clipboardSerializer") ||
    DOMSerializer.fromSchema(view.state.schema);
  let doc = detachedDoc(),
    wrap = doc.createElement("div");
  wrap.appendChild(serializer.serializeFragment(content, { document: doc }));

  let firstChild = wrap.firstChild,
    needsWrap,
    wrappers = 0;
  while (
    firstChild &&
    firstChild.nodeType === 1 &&
    (needsWrap = wrapMap[firstChild.nodeName.toLowerCase()])
  ) {
    for (let i = needsWrap.length - 1; i >= 0; i--) {
      let wrapper = doc.createElement(needsWrap[i]);
      while (wrap.firstChild) wrapper.appendChild(wrap.firstChild);
      wrap.appendChild(wrapper);
      wrappers++;
    }
    firstChild = wrap.firstChild;
  }

  if (firstChild && firstChild.nodeType == 1)
    firstChild.setAttribute(
      "data-pm-slice",
      `${openStart} ${openEnd}${
        wrappers ? ` -${wrappers}` : ""
      } ${JSON.stringify(context)}`
    );

  let text =
    view.someProp("clipboardTextSerializer", (f) => f(slice, view)) ||
    slice.content.textBetween(0, slice.content.size, "\n\n");

  return { dom: wrap, text };
}

export function removeNode(node) {
  if (node && node.parentNode) {
    node.parentNode.removeChild(node);
  }
}

export const dom = (editorView, dragStart) => {
  const dropElement = document.createElement("div");
  dropElement.setAttribute("draggable", "true");
  dropElement.className = "noteDragHandle";
  dropElement.textContent = "⠿";

  console.log("2124124");
  dropElement.addEventListener("dragstart", (e) => {
    dragStart(e, editorView);
  });

  console.log("MTAV DOM");
  return dropElement;
};

let _detachedDoc = null;
function detachedDoc() {
  return (
    _detachedDoc ||
    (_detachedDoc = document.implementation.createHTMLDocument("title"))
  );
}
