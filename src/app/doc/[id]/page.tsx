import dynamic from 'next/dynamic';

const CollaborativeEditor = dynamic(() => import('@/components/CollaborativeEditor'), { ssr: false });

export default function DocPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <CollaborativeEditor documentId={params.id} />
    </div>
  );
}
