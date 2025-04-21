
import { MessageSquarePlus, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useState } from "react";

const Welcome = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const handleNewChat = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
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
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <MessageSquarePlus className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-white">
          Welcome to Chat
        </h1>
        <p className="text-muted-foreground dark:text-white/80">
          Load a previous chat or click below to start a new chat
        </p>
        <Button 
          size="lg"
          className="w-auto gap-2 bg-gradient-primary shadow-sm hover:shadow-md transition-all duration-300"
          onClick={handleNewChat}
          disabled={isCreating}
        >
          {isCreating ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <MessageSquarePlus className="w-5 h-5" />
          )}
          New Chat
        </Button>
      </div>
    </div>
  );
};

export default Welcome;

