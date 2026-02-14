"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { seedStarterIdeas } from "@/app/actions/idea-bank";
import { useRouter } from "next/navigation";

export function SeedIdeasButton() {
  const [isSeeding, setIsSeeding] = useState(false);
  const router = useRouter();

  const handleSeed = async () => {
    const confirmed = confirm(
      "This will add 15 starter ideas to the Idea Bank. Continue?"
    );
    if (!confirmed) return;

    setIsSeeding(true);
    try {
      await seedStarterIdeas();
      alert("Successfully seeded 15 starter ideas!");
      router.refresh();
    } catch (error) {
      console.error("Error seeding ideas:", error);
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
      className="border-amber-300 text-amber-700 hover:bg-amber-50"
    >
      {isSeeding ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Seeding...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Seed Starter Ideas
        </>
      )}
    </Button>
  );
}
