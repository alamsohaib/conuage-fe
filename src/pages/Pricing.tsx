
import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, Brain } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui-custom/Button";

const PricingPage = () => {
  const navigate = useNavigate();

  const handleFooterNavigation = (link: string) => {
    navigate(link);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const features = [
    { name: "PDF uploads", beta: "Unlimited", enterprise: "Unlimited" },
    { name: "AI-Powered Chat sessions", beta: true, enterprise: true },
    { name: "AI Agent", beta: "Beta", enterprise: "Fine Tuned, Multi Agent Support" },
    { name: "Granular role-based access", beta: true, enterprise: true },
    { name: "Bring your own API Keys", beta: false, enterprise: true },
    { name: "Integration with Digital Systems & IoT Devices", beta: false, enterprise: true },
    { name: "On-Premise or Private Cloud Deployment", beta: false, enterprise: true }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/50 py-4">
        <div className="container flex justify-between items-center">
          <div 
            className="flex items-center space-x-1 cursor-pointer" 
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-md logo-shimmer">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl ml-2 text-foreground">conuage</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/auth/login")}
              className="border-primary/20 text-sm font-medium"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-16 px-4 md:px-6">
        <div className="text-center space-y-6 mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground dark:text-white">
            Simple,{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              transparent
            </span>{" "}
            pricing
          </h1>
          <p className="text-xl text-muted-foreground dark:text-gray-300 max-w-2xl mx-auto">
            Choose the plan that's right for your organization
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="flex">
            <Card className="border-primary/20 relative overflow-hidden animate-slide-up flex flex-col h-full w-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <CardContent className="p-6 flex-1 flex flex-col">
                <h2 className="text-2xl font-bold mb-4 text-foreground dark:text-white">Beta</h2>
                <div className="mb-6">
                  <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                    $0 per user
                  </span>
                </div>
                <div className="space-y-4 mb-6 flex-1">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {typeof feature.beta === 'boolean' ? (
                        feature.beta ? (
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        ) : (
                          <span className="h-5 w-5 flex-shrink-0" />
                        )
                      ) : (
                        <span className="h-5 w-5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-sm text-foreground dark:text-white">{feature.name}</p>
                        {typeof feature.beta !== 'boolean' && (
                          <p className="text-sm font-medium text-foreground dark:text-gray-300">{feature.beta}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full mt-auto"
                  onClick={() => navigate("/auth/signup")}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex">
            <Card className="border-primary/20 bg-primary/5 relative overflow-hidden animate-slide-up animation-delay-100 flex flex-col h-full w-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
              <CardContent className="p-6 flex-1 flex flex-col">
                <h2 className="text-2xl font-bold mb-4 text-foreground dark:text-white">Enterprise</h2>
                <div className="mb-6">
                  <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                    Custom
                  </span>
                </div>
                <div className="space-y-4 mb-6 flex-1">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {typeof feature.enterprise === 'boolean' ? (
                        feature.enterprise ? (
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        ) : (
                          <span className="h-5 w-5 flex-shrink-0" />
                        )
                      ) : (
                        <span className="h-5 w-5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-sm text-foreground dark:text-white">{feature.name}</p>
                        {typeof feature.enterprise !== 'boolean' && (
                          <p className="text-sm font-medium text-foreground dark:text-gray-300">{feature.enterprise}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full mt-auto"
                  onClick={() => navigate("/book-demo")}
                >
                  Book Demo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="py-10 border-t border-border/50 mt-20">
        <div className="container flex flex-col md:flex-row justify-between items-center">
          <div 
            className="flex items-center mb-4 md:mb-0 cursor-pointer" 
            onClick={() => handleFooterNavigation("/")}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-md mr-2">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground dark:text-white">conuage</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-4 md:mb-0">
            {[
              { label: "About", link: "/about" },
              { label: "Pricing", link: "/pricing" },
              { label: "FAQs", link: "/faqs" }
            ].map(({ label, link }) => (
              <button 
                key={label} 
                onClick={() => handleFooterNavigation(link)}
                className="text-sm text-muted-foreground dark:text-gray-300 hover:text-foreground dark:hover:text-white transition-colors cursor-pointer"
              >
                {label}
              </button>
            ))}
          </div>
          
          <div className="text-sm text-muted-foreground dark:text-gray-300">
            &copy; {new Date().getFullYear()} conuage — All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
