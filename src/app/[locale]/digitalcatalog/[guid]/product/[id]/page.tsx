interface Props {
  params: Promise<{ guid: string; id: string; locale: string }>;
}

export default async function CatalogProductPage({ params }: Props) {
  const { guid, id, locale } = await params;
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">
        Catalog Product: {id} (Catalog: {guid})
      </h1>
      <p className="mt-4">Coming soon...</p>
    </div>
  );
}
