"use client";
import { useState, useEffect } from "react";

interface Comment {
  id: string;
  author_id: string | null;
  body: string;
  created_at: string;
}

export default function CommentsSidebar({ documentId }: { documentId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");

  async function fetchComments() {
    const res = await fetch(`/api/comments?documentId=${documentId}`);
    const json = await res.json();
    setComments(json.data || []);
  }

  useEffect(() => {
    fetchComments();
  }, [documentId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!body.trim()) return;
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        document_id: documentId,
        body,
        anchor: {},
      }),
    });
    setBody("");
    fetchComments();
  }

  return (
    <aside className="w-96 border-l h-screen overflow-y-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Comments</h2>
      <ul className="space-y-4">
        {comments.map((comment) => (
          <li key={comment.id} className="border rounded p-2">
            <p className="text-sm text-gray-800">{comment.body}</p>
            <p className="text-xs text-gray-500">
              {new Date(comment.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col space-y-2">
        <textarea
          className="border rounded p-2 flex-1"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment..."
        />
        <button
          type="submit"
          className="px-3 py-2 bg-blue-500 text-white rounded"
        >
          Post Comment
        </button>
      </form>
    </aside>
  );
}
