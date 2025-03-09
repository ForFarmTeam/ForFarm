"use client";

import type React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Leaf, Home, Search, ArrowLeft, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app, this would navigate to search results
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-gray-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg text-center">
        <div className="relative mb-8">
          {/* Decorative elements */}
          <div className="absolute -top-16 -left-16 w-32 h-32 bg-green-100 dark:bg-green-900/30 rounded-full blur-3xl opacity-70"></div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-green-200 dark:bg-green-800/30 rounded-full blur-2xl opacity-70"></div>

          {/* Main icon */}
          <div className="relative bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-900 h-24 w-24 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <Leaf className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <h1 className="text-7xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 dark:from-green-400 dark:to-emerald-300 bg-clip-text text-transparent mb-4">
          404
        </h1>
        <h2 className="text-3xl font-bold mb-3 text-gray-800 dark:text-gray-100">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Looks like you've wandered into uncharted territory. This page doesn't exist or has been moved.
        </p>

        <div className="flex flex-col gap-6 mb-8">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for farms, crops, or pages..."
              className="pl-10 h-12 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="default"
              className="gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 h-12 px-6"
              onClick={() => router.push("/")}>
              <Home className="h-4 w-4" />
              Return Home
            </Button>
            <Button
              variant="outline"
              className="gap-2 h-12 border-green-200 dark:border-green-800"
              onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center text-sm text-muted-foreground">
          <Link href="/farms" className="flex items-center gap-1 hover:text-green-600 transition-colors">
            <MapPin className="h-3 w-3" />
            View Farms
          </Link>
          <Link href="/knowledge-hub" className="flex items-center gap-1 hover:text-green-600 transition-colors">
            <Leaf className="h-3 w-3" />
            Knowledge Hub
          </Link>
          <Link href="/contact" className="flex items-center gap-1 hover:text-green-600 transition-colors">
            <Search className="h-3 w-3" />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
