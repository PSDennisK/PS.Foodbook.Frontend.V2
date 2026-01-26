interface Props {
  params: Promise<{ guid: string; locale: string }>;
}

export default async function CatalogPage({ params }: Props) {
  const { guid, locale } = await params;
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Digital Catalog: {guid}</h1>
      <p className="mt-4">Coming soon...</p>
    </div>
  );
}
