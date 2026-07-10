import { CaseDetail } from "@/components/case-detail";

interface CasePageProps {
  params: {
    id: string;
  };
}

export default function CasePage({ params }: CasePageProps) {
  return (
    <div>
      <CaseDetail />
    </div>
  );
}
