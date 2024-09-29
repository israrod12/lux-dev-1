"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  ExternalLink,
  RefreshCw,
  LogOut,
  AlertTriangle,
  Copy,
  CheckCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Home() {
  const { data: session, update } = useSession();
  const [verificationUrl, setVerificationUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isConfigInvalid =
    process.env.NEXT_PUBLIC_DIDIT_CLIENT_ID === "your_client_id" ||
    process.env.NEXT_PUBLIC_DIDIT_CLIENT_ID === "" ||
    process.env.CLIENT_SECRET === "your_client_secret" ||
    process.env.CLIENT_SECRET === "" ||
    process.env.WEBHOOK_SECRET_KEY === "your_webhook_secret_key" ||
    process.env.WEBHOOK_SECRET_KEY === "";

  if (isConfigInvalid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            <p>
              Please set the following environment variables in your .env file:
            </p>
            <ul className="list-disc list-inside mt-2">
              <li>NEXT_PUBLIC_DIDIT_CLIENT_ID</li>
              <li>CLIENT_SECRET</li>
              <li>WEBHOOK_SECRET_KEY</li>
            </ul>
            <p className="mt-2">
              One or more of these variables are either not set or have invalid
              values.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8">
      <Card className="mx-auto w-full max-w-4xl shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-bold">
              Welcome, {session?.user?.name || session?.user?.email}!
            </CardTitle>
            {session?.user?.isVerified !== undefined && (
              <Badge
                variant={session.user.isVerified ? "default" : "outline"}
                className="text-sm py-1 px-3"
              >
                {session.user.isVerified ? "Verified" : "Not Verified"}
              </Badge>
            )}
          </div>
          <CardDescription>
            Manage your verification status and session here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!session?.user?.isVerified && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end space-y-2 sm:space-y-0 sm:space-x-2">
                {verificationUrl && (
                  <div className="w-full sm:w-2/3">
                    <Label
                      htmlFor="verification-url"
                      className="text-sm mb-1 block"
                    >
                      Verification URL:
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="verification-url"
                        value={verificationUrl}
                        readOnly
                        className="text-sm py-1"
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={copyToClipboard}
                              aria-label="Copy verification URL"
                            >
                              {copied ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{copied ? "Copied!" : "Copy URL"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() =>
                                window.open(verificationUrl, "_blank")
                              }
                              aria-label="Open verification URL in new tab"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Open in new tab</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                )}
                <Button
                  onClick={createVerificationSession}
                  disabled={isLoading}
                  className="w-full sm:w-auto whitespace-nowrap"
                >
                  {isLoading && (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {verificationUrl
                    ? "Create New Verification"
                    : "Create Verification Session"}
                </Button>
              </div>
              {verificationUrl && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="flex-1 py-2 text-sm">
                          Open Verification Iframe
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl h-[90vh]">
                        <iframe
                          src={verificationUrl}
                          className="w-full h-full min-h-[600px]"
                          title="Verification Session"
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      asChild
                      className="flex-1 py-2 text-sm"
                      variant="outline"
                    >
                      <a
                        href={verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open Verification in New Tab
                      </a>
                    </Button>
                  </div>
                  <Alert>
                    <AlertTitle>Integration Options</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">
                        Choose the integration method that works best for your
                        app:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          <strong>Iframe:</strong> Keeps the user on your page.
                          The callback URL will be loaded within the iframe.
                        </li>
                        <li>
                          <strong>New Tab:</strong> Opens a new tab for
                          verification. The callback URL will redirect the user
                          back to your app in the new tab.
                        </li>
                      </ul>
                      <p className="mt-2">
                        Ensure your callback URL is set up to handle the
                        verification result and update the user&apos;s status
                        accordingly.
                      </p>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          )}
          <Button
            onClick={() => signOut({ callbackUrl: "/signin" })}
            variant="secondary"
            className="w-full py-2 text-sm"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
