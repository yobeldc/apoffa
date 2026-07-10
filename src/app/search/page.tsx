import { GlobalSearch } from "@/components/global-search";

interface SearchPageProps {
  searchParams: { q?: string };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Search Cases</h1>
      <GlobalSearch initialQuery={searchParams.q} />
    </div>
  );
}
