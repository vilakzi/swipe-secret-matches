
// Completely disabled tooltip components to fix React hook violation
// All tooltip functionality has been removed

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const Tooltip = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const TooltipTrigger = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const TooltipContent = ({ children }: { children: React.ReactNode }) => {
  return null; // Completely disabled
};
