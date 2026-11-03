import { useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { api } from "../api.js";

function ToolButton({ label, active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      className={`tool${active ? " is-active" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
    >
      {children}
    </button>
  );
}

// Rich text editor (Tiptap). Calls onChange with the HTML after every edit.
export default function RichEditor({ initialHtml = "", onChange }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      Image,
      Placeholder.configure({ placeholder: "Tell your story…" }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: { class: "prose editor-surface", "aria-label": "Post body" },
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? "" : e.getHTML()),
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            underline: e.isActive("underline"),
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            bullet: e.isActive("bulletList"),
            ordered: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
            code: e.isActive("codeBlock"),
            link: e.isActive("link"),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
          }
        : {},
  });

  if (!editor) return null;

  function setLink() {
    const previous = editor.getAttributes("link").href || "";
    const url = window.prompt("Link address (leave empty to remove the link)", previous);
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
    }
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const { url } = await api.uploadImage(file);
      editor.chain().focus().setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, "") }).run();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  const run = (fn) => () => fn(editor.chain().focus()).run();

  return (
    <div className="editor">
      <div className="toolbar" role="toolbar" aria-label="Formatting">
        <ToolButton label="Bold" active={state.bold} onClick={run((c) => c.toggleBold())}>
          <b>B</b>
        </ToolButton>
        <ToolButton label="Italic" active={state.italic} onClick={run((c) => c.toggleItalic())}>
          <i>I</i>
        </ToolButton>
        <ToolButton label="Underline" active={state.underline} onClick={run((c) => c.toggleUnderline())}>
          <u>U</u>
        </ToolButton>
        <span className="tool-sep" />
        <ToolButton label="Heading" active={state.h2} onClick={run((c) => c.toggleHeading({ level: 2 }))}>
          H2
        </ToolButton>
        <ToolButton label="Subheading" active={state.h3} onClick={run((c) => c.toggleHeading({ level: 3 }))}>
          H3
        </ToolButton>
        <span className="tool-sep" />
        <ToolButton label="Bullet list" active={state.bullet} onClick={run((c) => c.toggleBulletList())}>
          • List
        </ToolButton>
        <ToolButton label="Numbered list" active={state.ordered} onClick={run((c) => c.toggleOrderedList())}>
          1. List
        </ToolButton>
        <ToolButton label="Quote" active={state.quote} onClick={run((c) => c.toggleBlockquote())}>
          “ ”
        </ToolButton>
        <ToolButton label="Code block" active={state.code} onClick={run((c) => c.toggleCodeBlock())}>
          {"</>"}
        </ToolButton>
        <span className="tool-sep" />
        <ToolButton label="Link" active={state.link} onClick={setLink}>
          Link
        </ToolButton>
        <ToolButton label="Insert image" disabled={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? "Uploading…" : "Image"}
        </ToolButton>
        <span className="tool-sep" />
        <ToolButton label="Undo" disabled={!state.canUndo} onClick={run((c) => c.undo())}>
          ↶
        </ToolButton>
        <ToolButton label="Redo" disabled={!state.canRedo} onClick={run((c) => c.redo())}>
          ↷
        </ToolButton>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          className="sr-only"
          onChange={handleFile}
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>
      {error && (
        <div className="banner banner-error" role="alert">
          {error}
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
