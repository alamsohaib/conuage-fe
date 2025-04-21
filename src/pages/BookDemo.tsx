
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Brain, Mail, Phone, MessageSquare, Send, User } from "lucide-react";
import Button from "@/components/ui-custom/Button";
import Input from "@/components/ui-custom/Input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const SERVICE_OPTIONS = [
  { label: "Advanced AI Agent", value: "ai_agent" },
  { label: "Bring your API Keys", value: "api_keys" },
  { label: "Integration with Digital Systems & IoT Devices", value: "integration" },
  { label: "Custom Workflows", value: "workflows" },
  { label: "On-Premise or Private Cloud Deployment", value: "on_premise" }
];

type FormData = {
  name: string;
  email: string;
  phone?: string;
  services: string[];
  message?: string;
  referral?: string;
};

const BookDemo = () => {
  const navigate = useNavigate();
  const { handleSubmit, register, control, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    defaultValues: { services: [] }
  });

  const onSubmit = async (data: FormData) => {
    toast({
      title: "Request received!",
      description: "We have received your demo request. We'll reach out soon."
    });
    reset();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50 py-4">
        <div className="container flex justify-between items-center">
          <div className="flex items-center space-x-1 cursor-pointer" onClick={() => navigate("/")}>
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

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-primary/5 to-transparent">
        <Card className="max-w-lg w-full mx-auto shadow-elevated bg-card/90 p-0 md:p-4 rounded-2xl">
          <div className="p-8 md:p-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2 text-foreground">
              Book a <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Demo</span>
            </h1>
            <p className="text-lg text-muted-foreground text-center mb-8">Tell us a bit about your needs and we'll get in touch!</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-5">
                {/* NAME field */}
                <div>
                  <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-white block mb-1">
                    Name <span className="text-destructive">*</span>
                  </label>
                  <div className="flex items-center border border-input rounded-md bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <User className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
                    <Input
                      id="name"
                      placeholder="Your full name"
                      {...register("name", { required: "Name is required" })}
                      error={errors.name?.message}
                      required
                      autoComplete="name"
                      type="text"
                      className="border-none p-0 focus:ring-0 focus-visible:ring-0"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* EMAIL field */}
                <div>
                  <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-white block mb-1">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <div className="flex items-center border border-input rounded-md bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <Mail className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
                    <Input
                      id="email"
                      placeholder="you@company.com"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[\w\-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                          message: "Enter a valid email"
                        }
                      })}
                      error={errors.email?.message}
                      required
                      autoComplete="email"
                      type="email"
                      className="border-none p-0 focus:ring-0 focus-visible:ring-0"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* PHONE field */}
                <div>
                  <label htmlFor="phone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-white block mb-1">
                    Phone
                  </label>
                  <div className="flex items-center border border-input rounded-md bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <Phone className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
                    <Input
                      id="phone"
                      placeholder="(Optional) Your phone number"
                      {...register("phone")}
                      error={errors.phone?.message}
                      autoComplete="tel"
                      type="tel"
                      className="border-none p-0 focus:ring-0 focus-visible:ring-0"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>
                  )}
                </div>

                {/* SERVICES checkboxes */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Please check the service you are most interested in <span className="text-destructive">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="services"
                    rules={{
                      validate: v => (v && v.length > 0) || "Select at least one"
                    }}
                    render={({ field }) => (
                      <div className="grid grid-cols-1 gap-3">
                        {SERVICE_OPTIONS.map(opt => (
                          <label key={opt.value} className="flex items-center gap-3 cursor-pointer select-none">
                            <Checkbox
                              checked={field.value?.includes(opt.value)}
                              onCheckedChange={checked => {
                                if (checked) {
                                  field.onChange([...(field.value ?? []), opt.value]);
                                } else {
                                  field.onChange((field.value ?? []).filter((v: string) => v !== opt.value));
                                }
                              }}
                              id={`chk-${opt.value}`}
                            />
                            <span className="text-sm text-foreground">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  />
                  {errors.services && (
                    <p className="text-xs text-destructive mt-1">{errors.services.message?.toString()}</p>
                  )}
                </div>

                {/* MESSAGE textarea */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Let us know how we can help you <span className="text-destructive">*</span>
                  </label>
                  <div className="relative flex items-start border border-input rounded-md bg-background px-3 pt-2 pb-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <MessageSquare className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0 mt-[3px]" />
                    <Textarea
                      {...register("message")}
                      className="resize-none min-h-[100px] border-none p-0 focus:ring-0 focus-visible:ring-0"
                      placeholder="Describe your requirements or use case"
                    />
                  </div>
                </div>

                {/* REFERRAL */}
                <Input
                  label="Where did you hear about us?"
                  placeholder="e.g., Google, LinkedIn, Friend"
                  {...register("referral")}
                  type="text"
                />
              </div>
              
              <Button
                className="w-full mt-4"
                type="submit"
                size="lg"
                loading={isSubmitting}
              >
                Submit
                <Send className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-border/50 mt-20">
        <div className="container flex flex-col md:flex-row justify-between items-center">
          <div
            className="flex items-center mb-4 md:mb-0 cursor-pointer"
            onClick={() => navigate("/")}
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
              <a
                key={label}
                href={link}
                onClick={e => {
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

export default BookDemo;

