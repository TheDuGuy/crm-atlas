import { getSeasonalCampaign } from "@/app/actions/seasonal-bank";
import { notFound } from "next/navigation";
import { SeasonalBankDetailClient } from "./client";

export default async function SeasonalBankDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const campaign = await getSeasonalCampaign(id);
    return <SeasonalBankDetailClient campaign={campaign} />;
  } catch (error) {
    notFound();
  }
}
