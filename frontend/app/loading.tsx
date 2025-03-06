import { Leaf } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-white flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
            <Leaf className="h-10 w-10 text-green-600" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-t-green-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold text-green-800 mb-2">Loading...</h2>
          <p className="text-muted-foreground max-w-md">
            We're preparing your farming data. This will only take a moment.
          </p>
        </div>

        <div className="w-64 h-2 bg-green-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
