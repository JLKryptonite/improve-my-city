import ComplaintDetail from '@/components/ComplaintDetail';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ComplaintDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ComplaintDetail id={id} />;
}
