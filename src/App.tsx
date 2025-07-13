
import React, { Suspense, lazy } from 'react';
import RootProviders from "@/components/providers/RootProviders";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";

// Lazy load MainApp for better initial load performance
const MainApp = lazy(() => import("@/components/app/MainApp"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
    <span className="ml-2 text-lg">Loading application...</span>
  </div>
);

const App = () => {
  return (
    <RootProviders>
      <Suspense fallback={<LoadingFallback />}>
        <MainApp />
      </Suspense>
      <Toaster />
    </RootProviders>
  );
};

export default App;
