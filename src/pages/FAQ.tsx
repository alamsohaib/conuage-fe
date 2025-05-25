
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Brain, 
  ArrowRight, 
  HelpCircle,
  Search,
  MessageSquare,
  FileText,
  Shield,
  Zap,
  Building2,
  Users,
  CreditCard,
  Settings
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const FAQ = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleFooterNavigation = (link: string) => {
    navigate(link);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const faqCategories = [
    {
      id: "general",
      title: "General",
      icon: HelpCircle,
      faqs: [
        {
          question: "What is conuage?",
          answer: "conuage is an AI-powered knowledge management platform that creates intelligent agents for your organization. These agents can understand, process, and interact with your documents and data, enabling natural language conversations with your organizational knowledge."
        },
        {
          question: "How does the AI agent work?",
          answer: "Our AI agent processes your uploaded documents using advanced natural language processing. It learns from your content and can answer questions, provide insights, and help you find information through conversational interactions."
        },
        {
          question: "What types of documents can I upload?",
          answer: "You can upload various document formats including PDFs, Word documents, PowerPoint presentations, text files, and more. Our system automatically processes and indexes the content for optimal AI interaction."
        },
        {
          question: "Is my data secure?",
          answer: "Absolutely. We implement enterprise-grade security measures including data encryption, secure storage, and strict access controls. Your data remains within your organization's secure environment."
        }
      ]
    },
    {
      id: "features",
      title: "Features",
      icon: Zap,
      faqs: [
        {
          question: "What can I do with the chat feature?",
          answer: "The chat feature allows you to have natural conversations with your AI agent. You can ask questions about your documents, request summaries, get insights, and even upload images for analysis."
        },
        {
          question: "How does document management work?",
          answer: "Our document management system allows managers and admins to upload, organize, and manage documents in folders. The AI automatically processes these documents to make them searchable and conversational."
        },
        {
          question: "What are the different user roles?",
          answer: "We have three user roles: End Users (can chat with AI), Managers (can manage documents and chat), and Organization Admins (full access to organization settings, users, and all features)."
        },
        {
          question: "Can I customize the AI's responses?",
          answer: "The AI learns from your specific documents and organizational context, naturally customizing its responses to your domain. Enterprise customers can access additional customization options."
        }
      ]
    },
    {
      id: "pricing",
      title: "Pricing & Plans",
      icon: CreditCard,
      faqs: [
        {
          question: "What pricing plans do you offer?",
          answer: "We offer flexible pricing plans for teams of all sizes, from small businesses to large enterprises. Visit our pricing page for detailed information about features and costs."
        },
        {
          question: "Is there a free trial?",
          answer: "Yes! We offer a free trial so you can experience the power of our AI agent before committing to a plan. Sign up to get started immediately."
        },
        {
          question: "What's included in the Enterprise Edition?",
          answer: "Our Enterprise Edition includes advanced agentic capabilities, integration with enterprise systems, custom workflows, priority support, and enhanced security features."
        },
        {
          question: "Can I upgrade or downgrade my plan?",
          answer: "Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades will take effect at the end of your current billing cycle."
        }
      ]
    },
    {
      id: "technical",
      title: "Technical",
      icon: Settings,
      faqs: [
        {
          question: "What integrations do you support?",
          answer: "We support integrations with popular business tools and enterprise systems. Our Enterprise Edition offers extensive integration capabilities with custom APIs and webhooks."
        },
        {
          question: "How do you handle large document volumes?",
          answer: "Our platform is designed to scale with your needs. We can handle large document volumes efficiently with optimized processing and storage systems."
        },
        {
          question: "What languages do you support?",
          answer: "Our AI agent supports multiple languages and can process documents in various languages while maintaining context and accuracy."
        },
        {
          question: "Do you offer API access?",
          answer: "Yes, we provide API access for Enterprise customers, allowing you to integrate our AI capabilities into your existing workflows and applications."
        }
      ]
    },
    {
      id: "support",
      title: "Support",
      icon: Users,
      faqs: [
        {
          question: "How can I get support?",
          answer: "We offer multiple support channels including email support, documentation, and for Enterprise customers, dedicated support representatives and priority assistance."
        },
        {
          question: "Do you provide training?",
          answer: "Yes, we provide onboarding assistance and training materials to help your team get the most out of conuage. Enterprise customers receive personalized training sessions."
        },
        {
          question: "What if I need help with setup?",
          answer: "Our team is here to help! We provide setup assistance and can guide you through the initial configuration to ensure you're getting maximum value from day one."
        },
        {
          question: "How often do you release updates?",
          answer: "We continuously improve our platform with regular updates and new features. All updates are automatically applied, and we notify users of significant new capabilities."
        }
      ]
    }
  ];

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

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
          <section className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary/10 rounded-full animate-pulse-subtle">
                <HelpCircle className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground dark:text-white mb-6">
              Frequently Asked <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">Questions</span>
            </h1>
            <p className="text-xl text-muted-foreground dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Find answers to common questions about conuage and how our AI-powered knowledge management platform can help your organization.
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </section>

          {/* FAQ Categories */}
          <section className="max-w-4xl mx-auto mb-20">
            {filteredFAQs.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <CardTitle className="text-xl text-foreground dark:text-white mb-2">No FAQs found</CardTitle>
                  <CardDescription className="text-muted-foreground dark:text-gray-300">
                    Try adjusting your search terms or browse all categories below.
                  </CardDescription>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {filteredFAQs.map((category) => (
                  <Card key={category.id} className="border border-border/50">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <category.icon className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle className="text-2xl text-foreground dark:text-white">{category.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {category.faqs.map((faq, index) => (
                          <AccordionItem key={index} value={`${category.id}-${index}`}>
                            <AccordionTrigger className="text-left text-foreground dark:text-white hover:text-primary">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground dark:text-gray-300 leading-relaxed">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Contact Section */}
          <section className="max-w-4xl mx-auto">
            <Card className="border border-border shadow-lg bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <MessageSquare className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold text-foreground dark:text-white mb-4">
                  Still Have Questions?
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground dark:text-gray-300 max-w-2xl mx-auto">
                  Can't find the answer you're looking for? Our team is here to help. Book a demo or get in touch with us directly.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={() => navigate("/book-demo")}
                    className="min-w-[160px] bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-blue-600 dark:hover:bg-blue-700 shadow-button inline-flex items-center"
                  >
                    <span>Book a Demo</span>
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => navigate("/auth/signup")}
                    className="min-w-[160px] bg-secondary/80 hover:bg-secondary text-secondary-foreground dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 border dark:border-gray-600"
                  >
                    Start Free Trial
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
              { label: "About", link: "/about" },
              { label: "Pricing", link: "/pricing" }
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

export default FAQ;
