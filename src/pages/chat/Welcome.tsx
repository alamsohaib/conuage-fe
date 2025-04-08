
import { Brain, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { toast } from "sonner";

const Welcome = () => {
  const navigate = useNavigate();

  const handleNewChat = async () => {
    try {
      const { data, error } = await api.chat.createChat({ name: "New Chat" });
      if (data) {
        toast.success("New chat created");
        navigate(`/chat/${data.id}`);
      } else if (error) {
        toast.error(error.message || "Failed to create chat");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create chat");
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10">
      <div className="max-w-xl w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 animate-pulse-subtle">
            <Brain className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            Welcome to <span className="text-primary">courage.ai</span> Chat
          </h1>
          <p className="text-muted-foreground">
            Ask questions, get insights, and explore your organizational knowledge with our advanced AI assistant.
          </p>
        </div>

        <Card className="transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Start a new conversation
            </CardTitle>
            <CardDescription>
              Begin chatting with our AI to unlock insights from your organization's knowledge base.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm italic text-muted-foreground">
                  "How can I improve customer engagement based on our current data?"
                </p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm italic text-muted-foreground">
                  "Summarize our quarterly financial performance and highlight key trends."
                </p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm italic text-muted-foreground">
                  "What are the most common support issues our customers face?"
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full gap-2 bg-gradient-primary shadow-sm hover:shadow-md transition-all duration-300"
              onClick={handleNewChat}
            >
              <Plus size={18} />
              New Chat
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Welcome;
