"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md text-center">
            <div className="bg-red-100 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>

            <h1 className="text-3xl font-bold mb-3">Critical Error</h1>
            <p className="text-gray-600 mb-6">The application has encountered a critical error and cannot continue.</p>

            {error.message && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-left">
                <p className="text-sm text-red-600 font-medium mb-1">Error details:</p>
                <p className="text-sm text-gray-600">{error.message}</p>
                {error.digest && <p className="text-xs text-gray-500 mt-2">Error ID: {error.digest}</p>}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                className="gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                onClick={() => reset()}>
                <RefreshCcw className="h-4 w-4" />
                Restart Application
              </Button>
              <Button
                className="gap-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded"
                onClick={() => (window.location.href = "/")}>
                <Home className="h-4 w-4" />
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
