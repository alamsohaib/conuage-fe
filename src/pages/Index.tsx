import { useNavigate } from "react-router-dom";
import Button from "@/components/ui-custom/Button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { 
  Brain, 
  Shield, 
  Zap, 
  ArrowRight, 
  Sparkles, 
  MessageSquare, 
  FileText, 
  Share2, 
  Rocket, 
  Database, 
  Lock
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50 py-4">
        <div className="container flex justify-between items-center">
          <div className="flex items-center space-x-1">
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

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-start">
        <div className="w-full py-16 md:py-24 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full animate-pulse-subtle">
                  <Brain className="w-10 h-10 text-primary" />
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-slide-down">
                Unleash the power of your 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 px-2">
                  organizational knowledge
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-down animation-delay-100">
                An AI Agent for your organization designed with security, simplicity, and user experience in mind.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 animate-slide-up animation-delay-200">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth/signup")}
                  className="min-w-[160px] shadow-button bg-gradient-primary hover:opacity-90 transition-all hover:scale-[1.02]"
                >
                  Get Started
                  <ArrowRight size={16} className="ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/auth/login")}
                  className="min-w-[160px] border-primary/20"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container px-4 md:px-6 py-12">
          {/* Intro Section */}
          <section className="mb-20">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-3xl font-bold tracking-tight">
                  Unlock the Power of AI for Your Organization
                </h2>
                <p className="text-xl text-muted-foreground">
                  Transform how your team interacts with knowledge.
                </p>
                <div className="pt-4">
                  <Button 
                    onClick={() => navigate("/auth/signup")} 
                    className="bg-gradient-primary"
                    size="lg"
                  >
                    Book a Demo
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-lg p-6 shadow-lg animate-fade-in">
                  <div className="flex items-center justify-center h-64">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl opacity-30"></div>
                      <MessageSquare className="w-20 h-20 text-primary relative z-10" />
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-card p-4 rounded-lg shadow-lg border border-border animate-fade-in animation-delay-200">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute -top-4 -left-4 bg-card p-4 rounded-lg shadow-lg border border-border animate-fade-in animation-delay-100">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
              </div>
            </div>
          </section>

          {/* AI Agent Section */}
          <section className="py-16 bg-card/30 rounded-2xl p-8 mb-20">
            <div className="max-w-4xl mx-auto text-center space-y-10">
              <h2 className="text-3xl font-bold">
                Meet Your AI Agent
              </h2>
              <p className="text-lg text-muted-foreground">
                Upload and process documents seamlessly—our AI agent learns from them, empowering your team to find answers, generate insights, and make data-driven decisions through natural language chat.
              </p>
              
              <div className="grid gap-8 md:grid-cols-3 pt-8">
                <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50 transition-all hover:shadow-md hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-lg mb-2">Document Processing</h3>
                  <p className="text-muted-foreground text-sm">
                    Seamlessly upload and process your organization's documents
                  </p>
                </div>
                
                <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50 transition-all hover:shadow-md hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-lg mb-2">Knowledge Learning</h3>
                  <p className="text-muted-foreground text-sm">
                    Our AI learns from your data, building a custom knowledge base
                  </p>
                </div>
                
                <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50 transition-all hover:shadow-md hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-lg mb-2">Natural Interactions</h3>
                  <p className="text-muted-foreground text-sm">
                    Ask questions and get answers in natural, conversational language
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Us Section */}
          <section className="mb-20">
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold text-center mb-10">
                Why Choose Our AI Agent?
              </h2>
              
              <div className="space-y-6">
                <div className="flex gap-4 items-start p-6 bg-card rounded-xl border border-border/50 transition-all hover:shadow-md">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2">Instant Knowledge Access</h3>
                    <p className="text-muted-foreground">
                      No more endless searches. Just ask, and get the answers you need.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start p-6 bg-card rounded-xl border border-border/50 transition-all hover:shadow-md">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2">Enterprise-Grade Security</h3>
                    <p className="text-muted-foreground">
                      Your data stays within your organization, ensuring privacy and compliance.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start p-6 bg-card rounded-xl border border-border/50 transition-all hover:shadow-md">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2">Scalable & Smart</h3>
                    <p className="text-muted-foreground">
                      From small teams to large enterprises, our AI adapts to your business needs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Enterprise Edition */}
          <section className="mb-20 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border/50 mb-6">
                <Rocket className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Enterprise Edition</span>
              </div>
              
              <h2 className="text-3xl font-bold">
                True Agentic Capabilities
              </h2>
              
              <p className="text-lg text-muted-foreground">
                Go beyond document interactions. Our Enterprise Edition integrates with your existing digital systems and IoT devices, enabling autonomous operations and intelligent automation.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 pt-6">
                <div className="flex flex-col items-center p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">Supercharge decision-making</h3>
                </div>
                
                <div className="flex flex-col items-center p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Share2 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">Seamlessly connect with enterprise systems</h3>
                </div>
                
                <div className="flex flex-col items-center p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Database className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">Enable AI-driven workflows and automation</h3>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="max-w-4xl mx-auto text-center">
            <div className="bg-card rounded-2xl p-10 border border-border shadow-lg">
              <h2 className="text-3xl font-bold mb-4">
                Get Started Today
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join forward-thinking organizations that are revolutionizing knowledge management. Book a demo now!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth/signup")}
                  className="min-w-[160px] shadow-button bg-gradient-primary"
                >
                  Sign Up Now
                  <ArrowRight size={16} className="ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/auth/login")}
                  className="min-w-[160px] border-primary/20"
                >
                  Book a Demo
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-border/50 mt-20">
        <div className="container flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-md mr-2">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">conuage</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-4 md:mb-0">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Documentation</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
          </div>
          
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} conuage — All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
