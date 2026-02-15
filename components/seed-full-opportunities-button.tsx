"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Database } from "lucide-react";
import { seedFullOpportunities } from "@/app/actions/seed-full-opportunities";
import { useRouter } from "next/navigation";

export function SeedFullOpportunitiesButton() {
  const [isSeeding, setIsSeeding] = useState(false);
  const router = useRouter();

  const handleSeed = async () => {
    const confirmed = confirm(
      "This will:\n\n" +
      "1. Deduplicate opportunities (archive/delete duplicates)\n" +
      "2. Populate all opportunity rich details\n" +
      "3. Create experiments for each opportunity\n\n" +
      "Continue?"
    );
    if (!confirmed) return;

    setIsSeeding(true);
    try {
      const result = await seedFullOpportunities();

      if (result.success) {
        const message =
          `✓ Seed Complete!\n\n` +
          `Duplicates handled: ${result.deduped}\n` +
          `Opportunities updated: ${result.opportunitiesUpdated}\n` +
          `Experiments created: ${result.experimentsCreated}\n` +
          (result.errors.length > 0 ? `\nErrors: ${result.errors.length} (check console)` : "");
        alert(message);
        router.refresh();
      } else {
        alert(`Failed to seed: ${result.error}\n\nCheck console for details.`);
      }
    } catch (error) {
      console.error("Error seeding opportunities:", error);
      alert("Failed to seed opportunities. Check console for details.");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Button
      onClick={handleSeed}
      disabled={isSeeding}
      variant="outline"
      className="border-blue-300 text-blue-700 hover:bg-blue-50"
    >
      {isSeeding ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Seeding...
        </>
      ) : (
        <>
          <Database className="mr-2 h-4 w-4" />
          Seed Full Opportunities + Experiments
        </>
      )}
    </Button>
  );
}
