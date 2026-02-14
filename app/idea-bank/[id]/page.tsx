import { getIdea } from "@/app/actions/idea-bank";
import { IdeaDetailRich } from "@/components/idea-detail-rich";
import { notFound } from "next/navigation";

export default async function IdeaBankDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idea = await getIdea(id);

  if (!idea) {
    notFound();
  }

  return <IdeaDetailRich idea={idea} />;
}
