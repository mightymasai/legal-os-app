'use client';
import {useEffect, useMemo, useState} from 'react';
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Placeholder from '@tiptap/extension-placeholder';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { createClient } from '@supabase/supabase-js';

type Props = { documentId: string };
export default function CollaborativeEditor({ documentId }: Props) {
  const supabase = useMemo(
    () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!),
    []
  );
  const [user, setUser] = useState({ name: 'User', color: '#555' });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? 'User';
      setUser({ name: email, color: '#' + ((Math.random()*0xffffff)|0).toString(16) });
    });
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
      Placeholder.configure({ placeholder: 'Draft your legal doc…' }),
      Collaboration.configure({ document: new Y.Doc() }),
      CollaborationCursor.configure({ provider: null as any, user }),
    ],
  });

  useEffect(() => {
    if (!editor) return;

    let cleanup = () => {};
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const ydoc = (editor.extensionManager.extensions.find((e:any)=>e.name==='collaboration') as any)
        .options.document as Y.Doc;

      const provider = new WebsocketProvider(
        process.env.NEXT_PUBLIC_COLLAB_WS!.replace('http','ws'),
        documentId,
        ydoc,
        { params: { token } as any }
      );

      const cursorExt: any = editor.extensionManager.extensions.find((e:any)=>e.name==='collaborationCursor');
      cursorExt?.configure({ provider, user });

      cleanup = () => provider.destroy();
    })();

    return () => cleanup();
  }, [editor, documentId]);

  return <div className="prose max-w-none"><EditorContent editor={editor} /></div>;
}
