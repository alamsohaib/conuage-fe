import { useNavigate } from "react-router-dom";
import Button from "@/components/ui-custom/Button";
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
  Database 
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import ChangingWord from "@/components/landing/ChangingWord";

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
            <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full animate-pulse-subtle">
                  <Brain className="w-10 h-10 text-primary" />
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight animate-slide-down text-foreground dark:text-white leading-tight">
                Unlock the power of your
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400 px-2 md:inline">
                  {" organizational knowledge"}
                </span>
              </h1>
              <p className="text-2xl md:text-3xl font-semibold text-foreground dark:text-white mt-4 animate-fade-in animation-delay-100">
                Create your own AI-powered{" "}
                <ChangingWord /> Advisor
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 animate-slide-up animation-delay-200">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth/signup")}
                  className="min-w-[160px] shadow-button bg-gradient-primary hover:opacity-90 transition-all hover:scale-[1.02] inline-flex items-center"
                >
                  <span>Get Started</span>
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
                <h2 className="text-3xl font-bold tracking-tight text-foreground dark:text-white">
                  Unlock the Power of AI for Your Organization
                </h2>
                <p className="text-xl text-muted-foreground dark:text-gray-300">
                  Transform how your team interacts with knowledge.
                </p>
                <div className="pt-4">
                  <Button 
                    onClick={() => navigate("/book-demo")} 
                    className="bg-gradient-primary inline-flex items-center"
                    size="lg"
                  >
                    <span>Book a Demo</span>
                    <ArrowRight size={16} className="ml-2" />
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
              <h2 className="text-3xl font-bold text-foreground dark:text-white">
                Meet Your AI Agent
              </h2>
              <p className="text-lg text-muted-foreground dark:text-gray-300">
                Upload and process documents seamlessly—our AI agent learns from them, empowering your team to find answers, generate insights, and make data-driven decisions through natural language chat.
              </p>
              
              <div className="grid gap-8 md:grid-cols-3 pt-8">
                {[
                  {
                    icon: FileText,
                    title: "Document Processing",
                    description: "Seamlessly upload and process your organization's documents"
                  },
                  {
                    icon: Brain,
                    title: "Knowledge Learning",
                    description: "Our AI learns from your data, building a custom knowledge base"
                  },
                  {
                    icon: MessageSquare,
                    title: "Natural Interactions",
                    description: "Ask questions and get answers in natural, conversational language"
                  }
                ].map(({ icon: Icon, title, description }, index) => (
                  <div 
                    key={index} 
                    className="bg-card rounded-xl p-6 shadow-sm border border-border/50 transition-all hover:shadow-md hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-medium text-lg mb-2 text-foreground dark:text-white">{title}</h3>
                    <p className="text-muted-foreground dark:text-gray-300 text-sm">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Why Choose Us Section */}
          <section className="mb-20">
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold text-center mb-10 text-foreground dark:text-white">
                Why Choose Our AI Agent?
              </h2>
              
              <div className="space-y-6">
                {[
                  {
                    icon: Zap,
                    iconColor: "green",
                    title: "Instant Knowledge Access",
                    description: "No more endless searches. Just ask, and get the answers you need."
                  },
                  {
                    icon: Shield,
                    iconColor: "blue",
                    title: "Enterprise-Grade Security",
                    description: "Your data stays within your organization, ensuring privacy and compliance."
                  },
                  {
                    icon: Sparkles,
                    iconColor: "purple",
                    title: "Scalable & Smart",
                    description: "From small teams to large enterprises, our AI adapts to your business needs."
                  }
                ].map(({ icon: Icon, iconColor, title, description }, index) => (
                  <div 
                    key={index} 
                    className="flex gap-4 items-start p-6 bg-card rounded-xl border border-border/50 transition-all hover:shadow-md"
                  >
                    <div className={`w-10 h-10 rounded-full bg-${iconColor}-100 dark:bg-${iconColor}-900/30 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 text-${iconColor}-600 dark:text-${iconColor}-400`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium mb-2 text-foreground dark:text-white">{title}</h3>
                      <p className="text-muted-foreground dark:text-gray-300">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Enterprise Edition */}
          <section className="mb-20 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border/50 mb-6">
                <Rocket className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground dark:text-white">Enterprise Edition</span>
              </div>
              
              <h2 className="text-3xl font-bold text-foreground dark:text-white">
                True Agentic Capabilities
              </h2>
              
              <p className="text-lg text-muted-foreground dark:text-gray-300">
                Go beyond document interactions. Our Enterprise Edition integrates with your existing digital systems and IoT devices, enabling autonomous operations and intelligent automation.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 pt-6">
                {[
                  { icon: Sparkles, title: "Supercharge decision-making" },
                  { icon: Share2, title: "Seamlessly connect with enterprise systems" },
                  { icon: Database, title: "Enable AI-driven workflows and automation" }
                ].map(({ icon: Icon, title }, index) => (
                  <div key={index} className="flex flex-col items-center p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2 text-foreground dark:text-white">{title}</h3>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="max-w-4xl mx-auto text-center">
            <div className="bg-card rounded-2xl p-10 border border-border shadow-lg">
              <h2 className="text-3xl font-bold mb-4 text-foreground dark:text-white">
                Get Started Today
              </h2>
              <p className="text-lg text-muted-foreground dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Join forward-thinking organizations that are revolutionizing knowledge management. Book a demo now!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth/signup")}
                  className="min-w-[160px] shadow-button bg-gradient-primary inline-flex items-center"
                >
                  <span>Sign Up Now</span>
                  <ArrowRight size={16} className="ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/book-demo")}
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
            <span className="font-bold text-lg text-foreground dark:text-white">conuage</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-4 md:mb-0">
            {[
              { label: "About", link: "/about" },
              { label: "Pricing", link: "/pricing" },
              { label: "FAQs", link: "/faqs" }
            ].map(({ label, link }) => (
              <a 
                key={label} 
                href={link}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(link);
                }}
                className="text-sm text-muted-foreground dark:text-gray-300 hover:text-foreground dark:hover:text-white transition-colors"
              >
                {label}
              </a>
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

export default Index;
