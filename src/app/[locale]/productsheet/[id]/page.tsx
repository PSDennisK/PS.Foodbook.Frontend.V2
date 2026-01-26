interface Props {
  params: Promise<{ id: string; locale: string }>;
}

export default async function ProductSheetPage({ params }: Props) {
  const { id, locale } = await params;
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Product Sheet: {id}</h1>
      <p className="mt-4">Coming soon...</p>
    </div>
  );
}
