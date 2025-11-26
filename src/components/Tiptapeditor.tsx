import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

interface TiptapEditorProps {
  content: string;
  onUpdate: (content: string) => void;
  editable?: boolean;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ content, onUpdate, editable = true }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML())
    },
    editable: editable,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert min-h-[200px] w-full p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500',
      },
    },
  })

  // Update editor content when the prop changes, but only if not currently focused
  React.useEffect(() => {
    if (editor && !editor.isFocused && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null
  }

  return (
    <EditorContent editor={editor} />
  )
}

export default TiptapEditor
