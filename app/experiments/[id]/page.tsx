import { supabase } from "@/lib/supabase/client";
import { ExperimentDetail } from "@/components/experiment-detail";
import { notFound } from "next/navigation";

export default async function ExperimentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: experiment, error } = await supabase
    .from("experiments")
    .select(`
      *,
      opportunities (title, id)
    `)
    .eq("id", id)
    .single();

  if (error || !experiment) {
    notFound();
  }

  return <ExperimentDetail experiment={experiment} />;
}
