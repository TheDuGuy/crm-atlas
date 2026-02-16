import { getWorkflowHealthDetail } from "@/app/actions/health";
import { WorkflowHealthDetail } from "@/components/workflow-health-detail";
import { notFound } from "next/navigation";

export default async function WorkflowHealthPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const metrics = await getWorkflowHealthDetail(id);

    if (!metrics || metrics.length === 0) {
      notFound();
    }

    return <WorkflowHealthDetail workflowId={id} metrics={metrics} />;
  } catch (error) {
    console.error('Error loading workflow health:', error);
    notFound();
  }
}
