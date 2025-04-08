
import * as React from "react";
import { SidebarContext } from "./sidebar-types";

// Create sidebar context
const SidebarContextProvider = React.createContext<SidebarContext | null>(null);

// Hook to use sidebar context
export function useSidebar() {
  const context = React.useContext(SidebarContextProvider);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

export { SidebarContextProvider };
