"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ExternalLink, RefreshCw, LogOut } from "lucide-react";

export function Page() {
  const { data: session, update } = useSession();
  const [verificationUrl, setVerificationUrl] = useState("");
  const [isIframe, setIsIframe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const createVerificationSession = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setVerificationUrl(data.url);
    } catch (error) {
      console.error("Error creating verification session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      update();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [update]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome, {session?.user?.name || session?.user?.email}!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {session?.user?.isVerified !== undefined && (
            <div className="text-center">
              <span className="text-sm font-medium mr-2">
                Verification Status:
              </span>
              <Badge
                variant={session.user.isVerified ? "default" : "destructive"}
              >
                {session.user.isVerified ? "Verified" : "Not Verified"}
              </Badge>
            </div>
          )}
          {!session?.user?.isVerified && (
            <>
              <Button
                onClick={createVerificationSession}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading && (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                )}
                {verificationUrl
                  ? "Create New Verification Session"
                  : "Create Verification Session"}
              </Button>
              {verificationUrl && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="verification-url">
                      Current Verification URL:
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="verification-url"
                        value={verificationUrl}
                        readOnly
                        className="flex-grow"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => window.open(verificationUrl, "_blank")}
                        aria-label="Open verification URL in new tab"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="iframe-toggle"
                      checked={isIframe}
                      onCheckedChange={setIsIframe}
                    />
                    <Label htmlFor="iframe-toggle">Load as iframe</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Integration can be done via redirect or iframe. App
                    developers may choose the method that works best for them.
                  </p>
                  {isIframe ? (
                    <div className="aspect-video w-full">
                      <iframe
                        src={verificationUrl}
                        className="w-full h-full border rounded-md"
                        title="Verification Session"
                      />
                    </div>
                  ) : (
                    <Button asChild className="w-full" variant="secondary">
                      <a
                        href={verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Start Verification
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
          <Button
            onClick={() => signOut({ callbackUrl: "/signin" })}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
