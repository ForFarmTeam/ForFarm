"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home, ArrowLeft, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  const router = useRouter();

  // Determine error type to show appropriate message
  const getErrorMessage = () => {
    if (error.message.includes("FARM_NOT_FOUND")) {
      return "The farm you're looking for could not be found.";
    }
    if (error.message.includes("CROP_NOT_FOUND")) {
      return "The crop you're looking for could not be found.";
    }
    if (error.message.includes("UNAUTHORIZED")) {
      return "You don't have permission to access this resource.";
    }
    if (error.message.includes("NETWORK")) {
      return "Network error. Please check your internet connection.";
    }
    return "We apologize for the inconvenience. An unexpected error has occurred.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-red-950/30 dark:to-gray-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg text-center">
        <div className="relative mb-8">
          {/* Decorative elements */}
          <div className="absolute -top-16 -left-16 w-32 h-32 bg-red-100 dark:bg-red-900/30 rounded-full blur-3xl opacity-70"></div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-red-200 dark:bg-red-800/30 rounded-full blur-2xl opacity-70"></div>

          {/* Main icon */}
          <div className="relative bg-gradient-to-br from-red-100 to-red-200 dark:from-red-800 dark:to-red-900 h-24 w-24 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">Something went wrong</h1>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">{getErrorMessage()}</p>

        {error.message && !["FARM_NOT_FOUND", "CROP_NOT_FOUND", "UNAUTHORIZED"].includes(error.message) && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8 text-left">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Error details:</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
            {error.digest && <p className="text-xs text-muted-foreground mt-2">Error ID: {error.digest}</p>}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Button
            variant="default"
            className="gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 h-12 px-6"
            onClick={() => reset()}>
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            className="gap-2 h-12 border-green-200 dark:border-green-800"
            onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button
            variant="outline"
            className="gap-2 h-12 border-green-200 dark:border-green-800"
            onClick={() => router.push("/")}>
            <Home className="h-4 w-4" />
            Home
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p className="mb-2">
            Need help?{" "}
            <Link href="/contact" className="text-green-600 hover:underline">
              Contact Support
            </Link>
          </p>
          <p className="flex items-center justify-center gap-1">
            <HelpCircle className="h-3 w-3" />
            <span>Support Code: {error.digest ? error.digest.substring(0, 8) : "Unknown"}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
