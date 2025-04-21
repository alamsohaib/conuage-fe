
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Function to get the initial theme that works in both browser and SSR contexts
const getInitialTheme = (): Theme => {
  // For SSR or when window is not available, return a default theme
  if (typeof window === 'undefined') return 'light';
  
  // Check localStorage first
  const savedTheme = window.localStorage.getItem('theme') as Theme;
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
  
  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  // Default to light
  return 'light';
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Use state initializer function to avoid issues during SSR
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    // Update localStorage
    localStorage.setItem('theme', theme);
    
    // Update document class
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // Set custom transition when changing modes
    const setTransition = () => {
      document.documentElement.style.setProperty('transition', 'background-color 0.3s ease-in-out, color 0.3s ease-in-out');
    };
    
    setTransition();
    
    const removeTransition = () => {
      document.documentElement.style.removeProperty('transition');
    };
    
    // Remove transition after animation completes
    const timer = setTimeout(removeTransition, 300);
    
    return () => clearTimeout(timer);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
