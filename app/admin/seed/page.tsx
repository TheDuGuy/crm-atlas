"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { seedOpportunitiesAndSignals } from "@/app/actions/opportunities";
import { CheckCircle, XCircle, Loader2, Database } from "lucide-react";

export default function AdminSeedPage() {
  const [email, setEmail] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [authError, setAuthError] = useState("");

  const checkAuthorization = () => {
    const allowedEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(e => e.trim());

    if (allowedEmails.includes(email)) {
      setIsAuthorized(true);
      setAuthError("");
    } else {
      setAuthError("Unauthorized email address");
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    setResults(null);

    try {
      const seedResults = await seedOpportunitiesAndSignals();
      setResults(seedResults);
    } catch (error: any) {
      setResults({
        opportunities: { created: 0, errors: [error.message] },
        signals: { created: 0, errors: [] },
      });
    } finally {
      setIsSeeding(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <Card>
          <CardHeader>
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>Enter your authorized email to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkAuthorization()}
              />
            </div>
            {authError && (
              <Alert variant="destructive">
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
            <Button onClick={checkAuthorization} className="w-full">
              Verify Access
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Database Seeding</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Seed opportunities and missing signals based on CRM audit
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Seed Opportunities & Missing Signals
          </CardTitle>
          <CardDescription>
            This will insert 18 opportunities and 15 missing signals into the database.
            Products will be auto-created if they don't exist.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-2 text-sm">
            <p className="font-semibold">What will be seeded:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
              <li><strong>18 Opportunities</strong>: Cross-product upgrades, dormancy ladder, unpaid conversion, etc.</li>
              <li><strong>15 Missing Signals</strong>: Field/event gaps for better targeting and orchestration</li>
              <li>Auto-links to existing products and flows where possible</li>
              <li>Creates new products if referenced but missing</li>
            </ul>
          </div>

          <Button
            onClick={handleSeed}
            disabled={isSeeding}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isSeeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Seed Database
              </>
            )}
          </Button>

          {results && (
            <div className="space-y-4 mt-6">
              <Alert className={results.opportunities.created > 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <strong>Opportunities:</strong> {results.opportunities.created} created
                  {results.opportunities.errors.length > 0 && (
                    <span className="text-red-600">
                      , {results.opportunities.errors.length} errors
                    </span>
                  )}
                </AlertDescription>
              </Alert>

              <Alert className={results.signals.created > 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <strong>Missing Signals:</strong> {results.signals.created} created
                  {results.signals.errors.length > 0 && (
                    <span className="text-red-600">
                      , {results.signals.errors.length} errors
                    </span>
                  )}
                </AlertDescription>
              </Alert>

              {(results.opportunities.errors.length > 0 || results.signals.errors.length > 0) && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <p className="font-semibold text-red-800 dark:text-red-200 mb-2">Errors:</p>
                  <div className="space-y-1 text-sm text-red-600 dark:text-red-300">
                    {[...results.opportunities.errors, ...results.signals.errors].map((error: string, idx: number) => (
                      <div key={idx}>• {error}</div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button asChild variant="outline" className="w-full">
                  <a href="/opportunities">View Opportunities →</a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seeded Content Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Key Opportunities:</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                <li>Cross-Product Upgrade Engine (Impact: 5, Effort: 4)</li>
                <li>Unpaid Paylink Conversion Engine (Impact: 4, Effort: 3)</li>
                <li>Dormancy Ladder 7/14/30-day (Impact: 5, Effort: 3)</li>
                <li>Mid-Funnel Intent Instrumentation (Impact: 5, Effort: 2)</li>
                <li>Card Reader Delivery-to-Transaction Gap (Impact: 5, Effort: 3)</li>
                <li>Flow Conflict Governance (Impact: 4, Effort: 4)</li>
                <li>TTP Transaction Momentum Builder (Impact: 4, Effort: 2)</li>
                <li>Churn Prediction Model (Impact: 5, Effort: 5)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Key Missing Signals:</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                <li>paylink_share_method (field) - Track sharing channel</li>
                <li>card_reader_setup_completed (event) - Setup vs. delivered</li>
                <li>feature_page_viewed (event) - Mid-funnel intent</li>
                <li>monthly_tpv_band (field) - Essential for upgrade targeting</li>
                <li>product_adoption_stage (field) - Unified lifecycle</li>
                <li>message_fatigue_score (field) - Prevent over-messaging</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
