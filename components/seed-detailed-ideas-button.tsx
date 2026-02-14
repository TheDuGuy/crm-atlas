"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, FileText } from "lucide-react";
import { seedDetailedIdeas } from "@/app/actions/seed-detailed-ideas";
import { useRouter } from "next/navigation";

export function SeedDetailedIdeasButton() {
  const [isSeeding, setIsSeeding] = useState(false);
  const router = useRouter();

  const handleSeed = async () => {
    const confirmed = confirm(
      "This will add 12 detailed campaign ideas with full rich fields to the Idea Bank. Continue?"
    );
    if (!confirmed) return;

    setIsSeeding(true);
    try {
      const result = await seedDetailedIdeas();
      alert(`Successfully seeded ${result.count} detailed ideas!`);
      router.refresh();
    } catch (error) {
      console.error("Error seeding detailed ideas:", error);
      alert("Failed to seed ideas. Check console for details.");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Button
      onClick={handleSeed}
      disabled={isSeeding}
      variant="outline"
      className="border-purple-300 text-purple-700 hover:bg-purple-50"
    >
      {isSeeding ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Seeding...
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          Seed Detailed Ideas
        </>
      )}
    </Button>
  );
}
