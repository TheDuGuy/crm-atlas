import { supabase } from "@/lib/supabase/client";
import { OpportunityDetailRich } from "@/components/opportunity-detail-rich";
import { notFound } from "next/navigation";

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: opportunity, error } = await supabase
    .from("opportunities")
    .select(`
      *,
      products (name),
      flows (name)
    `)
    .eq("id", id)
    .single();

  if (error || !opportunity) {
    notFound();
  }

  return <OpportunityDetailRich opportunity={opportunity} />;
}
