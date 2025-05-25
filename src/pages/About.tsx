
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Brain, 
  Shield, 
  Zap, 
  ArrowRight, 
  Users, 
  Target, 
  Lightbulb,
  Heart,
  Globe,
  Award
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const About = () => {
  const navigate = useNavigate();

  const handleFooterNavigation = (link: string) => {
    navigate(link);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const values = [
    {
      icon: Brain,
      title: "Innovation",
      description: "We're at the forefront of AI technology, constantly pushing boundaries to create smarter solutions."
    },
    {
      icon: Shield,
      title: "Security",
      description: "Your data and privacy are paramount. We implement enterprise-grade security measures."
    },
    {
      icon: Heart,
      title: "User-Centric",
      description: "Every feature we build is designed with our users' needs and experiences in mind."
    },
    {
      icon: Globe,
      title: "Accessibility",
      description: "We believe powerful AI tools should be accessible to organizations of all sizes."
    }
  ];

  const team = [
    {
      role: "AI Research",
      description: "Our team of AI researchers and engineers work tirelessly to advance the capabilities of organizational knowledge management."
    },
    {
      role: "Product Development",
      description: "We focus on creating intuitive, powerful tools that solve real business problems."
    },
    {
      role: "Customer Success",
      description: "We're committed to ensuring every customer achieves their goals with our platform."
    }
  ];

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
              variant="secondary" 
              size="sm" 
              onClick={() => navigate("/")}
              className="bg-secondary/80 hover:bg-secondary text-secondary-foreground dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 border dark:border-gray-600 text-sm font-medium"
            >
              Back to Home
            </Button>
            <Button 
              size="sm" 
              onClick={() => navigate("/auth/login")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-blue-600 dark:hover:bg-blue-700 text-sm font-medium"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container px-4 md:px-6 py-16">
          {/* Hero Section */}
          <section className="max-w-4xl mx-auto text-center mb-20 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary/10 rounded-full animate-pulse-subtle">
                <Users className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground dark:text-white mb-6">
              About <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">conuage</span>
            </h1>
            <p className="text-xl text-muted-foreground dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              We're transforming how organizations interact with their knowledge by creating intelligent AI agents that understand, learn, and respond to your business needs.
            </p>
          </section>

          {/* Mission Section */}
          <section className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold text-foreground dark:text-white">Our Mission</h2>
                </div>
                <p className="text-lg text-muted-foreground dark:text-gray-300 leading-relaxed">
                  To democratize access to intelligent knowledge management by providing organizations of all sizes with powerful AI agents that can understand, process, and interact with their unique information ecosystem.
                </p>
                <p className="text-lg text-muted-foreground dark:text-gray-300 leading-relaxed">
                  We believe that every organization should have the power to unlock the full potential of their knowledge assets, regardless of their size or technical expertise.
                </p>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-2xl p-8 shadow-lg animate-fade-in">
                  <div className="flex items-center justify-center h-64">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl opacity-30"></div>
                      <Lightbulb className="w-24 h-24 text-primary relative z-10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="mb-20">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground dark:text-white mb-4">Our Values</h2>
                <p className="text-lg text-muted-foreground dark:text-gray-300">
                  The principles that guide everything we do
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {values.map(({ icon: Icon, title, description }, index) => (
                  <Card key={index} className="border border-border/50 transition-all hover:shadow-md hover:-translate-y-1">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl text-foreground dark:text-white">{title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-muted-foreground dark:text-gray-300 text-base">
                        {description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="mb-20 bg-card/30 rounded-2xl p-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground dark:text-white mb-4">Our Team</h2>
                <p className="text-lg text-muted-foreground dark:text-gray-300">
                  Passionate experts dedicated to advancing AI-powered knowledge management
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {team.map(({ role, description }, index) => (
                  <div key={index} className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Award className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground dark:text-white">{role}</h3>
                    <p className="text-muted-foreground dark:text-gray-300">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="max-w-4xl mx-auto text-center">
            <Card className="border border-border shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-3xl font-bold text-foreground dark:text-white mb-4">
                  Ready to Transform Your Knowledge Management?
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground dark:text-gray-300 max-w-2xl mx-auto">
                  Join forward-thinking organizations that are revolutionizing how they work with knowledge. Start your journey today.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={() => navigate("/auth/signup")}
                    className="min-w-[160px] bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-blue-600 dark:hover:bg-blue-700 shadow-button inline-flex items-center"
                  >
                    <span>Get Started</span>
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => navigate("/book-demo")}
                    className="min-w-[160px] bg-secondary/80 hover:bg-secondary text-secondary-foreground dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 border dark:border-gray-600"
                  >
                    Book a Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
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
              { label: "Home", link: "/" },
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

export default About;
