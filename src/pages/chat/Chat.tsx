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
  const { userRole, logout } = useAuth();

  const isManagerOrAdmin = userRole === 'manager' || userRole === 'org_admin';

  useEffect(() => {
    // Reset messages when changing chats to avoid showing old messages
    setMessages([]);
    
    // Handle special "welcome" route or empty chatId
    if (!chatId) {
      navigate("/chat/welcome", { replace: true });
      return;
    }
    
    // Don't attempt to fetch data for the welcome screen
    if (chatId === "welcome") {
      setIsFetching(false);
      navigate("/chat/welcome", { replace: true });
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
          const isUnauthorized = error.code === '401' || error.message.includes('401') || error.message.toLowerCase().includes('unauthorized');
          
          if (isUnauthorized) {
            console.log("Session expired or invalid when fetching chat.");
            toast.error("Your session has expired. Please login again.");
            logout();
            navigate("/login");
            return;
          } else {
            toast.error("Failed to load chat");
            if (error.message && error.message.includes("not found")) {
              navigate("/chat/welcome");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching chat:", error);
        toast.error("Failed to load chat");
        navigate("/chat/welcome");
      } finally {
        setIsFetching(false);
      }
    };

    fetchChat();
  }, [chatId, navigate, logout]);

  const handleSendMessage = async (content: string, imageFile?: File | null, imagePreview?: string | null) => {
    if (!content.trim() && !imageFile) return;

    if (!chatId || chatId === "welcome") {
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
    const aiResponseId = `ai-${Date.now()}`;
    
    const userMessage: Message = {
      id: tempId,
      chat_id: chatId || "",
      content,
      role: "user",
      created_at: new Date().toISOString(),
      has_image: !!imageFile
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const { signal } = controller;
      
      const formData = new FormData();
      formData.append("content", content);
      
      if (imageFile) {
        formData.append("image", imageFile);
      }
      
      const initialAiMessage: Message = {
        id: aiResponseId,
        chat_id: chatId || "",
        content: "",
        role: "assistant",
        created_at: new Date().toISOString(),
        isStreaming: true,
      };
      
      setMessages(prev => [...prev, initialAiMessage]);
      
      const response = await fetch(`${api.baseUrl}/api/v1/chat/chats/${chatId}/messages/stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api.getToken()}`
        },
        body: formData,
        signal
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        if (errorData.includes("Daily token limit reached")) {
          toast.error("You have reached your daily message limit. Please try again tomorrow.");
          throw new Error("Token limit reached");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is null');
      }
      
      let accumulatedContent = "";
      let finalMessageId = "";
      
      const decoder = new TextDecoder();
      let buffer = "";
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (line.trim() === "") continue;
          
          if (line.startsWith("data: ")) {
            const jsonStr = line.substring(6);
            
            // Skip the [DONE] message
            if (jsonStr.trim() === "[DONE]") {
              continue;
            }
            
            try {
              const jsonData = JSON.parse(jsonStr);
              
              // Only process individual content chunks, not the final complete response
              if (jsonData.content && !jsonData.sources) {
                // Add the new content chunk immediately
                accumulatedContent += jsonData.content;
                
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === aiResponseId 
                      ? { ...msg, content: accumulatedContent } 
                      : msg
                  )
                );
              }
              
              // Store the final message ID when we get the complete response with sources
              if (jsonData.sources !== undefined) {
                finalMessageId = jsonData.message_id || aiResponseId;
              }
            } catch (e) {
              console.error("Error parsing stream data:", e, line);
            }
          }
        }
      }
      
      // Update the final message with the real ID and mark streaming as complete
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiResponseId 
            ? { 
                ...msg, 
                id: finalMessageId || aiResponseId,
                content: accumulatedContent,
                isStreaming: false
              } 
            : msg
        )
      );
      
    } catch (error) {
      console.error("Error sending message:", error);
      if (!(error instanceof Error) || !error.message.includes("Token limit reached")) {
        toast.error("Failed to send message");
      }
      // Remove both the user message and AI message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId && msg.id !== aiResponseId));
    } finally {
      setIsLoading(false);
    }
  };

  // For welcome screen, don't render the chat UI
  if (chatId === "welcome") {
    return null; // Let the Welcome component render instead
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden animate-fade-in">
      <header className="border-b border-border/50 p-4 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/chat/welcome")}
              className="rounded-full dark:text-white/80 hover:dark:text-white"
              aria-label="Back to chats"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-md">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-lg font-semibold truncate dark:text-white">
                {isFetching ? "Loading..." : chatName || "New Chat"}
              </h1>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full dark:text-white/80 hover:dark:text-white"
            aria-label="Chat options"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
        <MessageList 
          messages={messages} 
          isLoading={isLoading || isFetching}
        />
      </div>
      
      <div className="border-t border-border/50 bg-background p-4">
        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Chat;
