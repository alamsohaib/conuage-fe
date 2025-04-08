
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Message } from "@/lib/types";
import { toast } from "sonner";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Bot, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const Chat = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [chatName, setChatName] = useState("");
  const { userRole } = useAuth();

  const isManagerOrAdmin = userRole === 'manager' || userRole === 'org_admin';

  useEffect(() => {
    if (!chatId) {
      setIsFetching(false);
      return;
    }

    const fetchChat = async () => {
      setIsFetching(true);
      try {
        const { data, error } = await api.chat.getChat(chatId);
        if (data) {
          setMessages(data.messages || []);
          setChatName(data.chat?.name || "New Chat");
        } else if (error) {
          toast.error(error.message || "Failed to load chat");
          if (error.message.includes("not found")) {
            navigate("/chat");
          }
        }
      } catch (error) {
        console.error("Error fetching chat:", error);
        toast.error("Failed to load chat");
      } finally {
        setIsFetching(false);
      }
    };

    fetchChat();
  }, [chatId, navigate]);

  const handleSendMessage = async (content: string, image?: string | null) => {
    if (!content.trim() && !image) return;

    if (!chatId) {
      try {
        const { data, error } = await api.chat.createChat({ name: content.substring(0, 30) });
        if (data) {
          navigate(`/chat/${data.id}`);
          return;
        } else if (error) {
          toast.error(error.message || "Failed to create chat");
          return;
        }
      } catch (error) {
        console.error("Error creating chat:", error);
        toast.error("Failed to create chat");
        return;
      }
    }

    const tempId = Date.now().toString();
    const userMessage: Message = {
      id: tempId,
      chat_id: chatId,
      content,
      role: "user",
      created_at: new Date().toISOString(),
      has_image: !!image
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await api.chat.sendMessage(chatId, { content, image });
      if (error) {
        toast.error(error.message || "Failed to send message");
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      } else if (data) {
        const chatResponse = await api.chat.getChat(chatId);
        if (chatResponse.data) {
          const updatedMessages = chatResponse.data.messages?.map(message => {
            const existingMessage = messages.find(
              m => m.content === message.content && 
                  m.role === message.role && 
                  m.has_image
            );
            if (existingMessage?.has_image && message.role === 'user') {
              return { ...message, has_image: true };
            }
            return message;
          }) || [];
          
          setMessages(updatedMessages);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden animate-fade-in">
      <header className="border-b border-border/50 p-4 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/chat")}
              className="rounded-full"
              aria-label="Back to chats"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-md">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-lg font-semibold truncate">{chatName || "New Chat"}</h1>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Chat options"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
        <MessageList messages={messages} isLoading={isLoading || isFetching} />
      </div>
      
      <div className="border-t border-border/50 bg-background p-4">
        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Chat;
