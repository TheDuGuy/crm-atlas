import { getFlow } from "@/app/actions/flows";
import { FlowDetailClient } from "@/components/flow-detail-client";
import { notFound } from "next/navigation";

export default async function FlowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const flow = await getFlow(id);

  if (!flow) {
    notFound();
  }

  return <FlowDetailClient flow={flow} />;
}
