"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@stackframe/stack";
import { RefreshCw } from "lucide-react";

export default function AdminPage() {
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleBackfill = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/users/backfill", {
        method: "POST",
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">
            Please sign in to access admin tools
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">Admin Tools</h1>

        <Card>
          <CardHeader>
            <CardTitle>User Database Sync</CardTitle>
            <CardDescription>
              Sync all Stack Auth users to the database. This will create
              database entries for any users that don't have one yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleBackfill}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing Users...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Users to Database
                </>
              )}
            </Button>

            {result && (
              <div className="mt-4 p-4 bg-secondary rounded-lg">
                <h3 className="font-semibold mb-2">Results:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
