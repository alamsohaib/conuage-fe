import { Message, MessageSource } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { User, Bot, Image as ImageIcon, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

const MessageList = ({ messages, isLoading }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Bot size={64} className="text-muted-foreground dark:text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-primary">Start a conversation</h3>
        <p className="text-muted-foreground dark:text-gray-300 max-w-md">
          Send a message to start chatting with the AI assistant.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 pb-6">
      {/* Chat loading indicator */}
      {isLoading && !messages.some(msg => msg.isStreaming) && (
        <div className="flex justify-center items-center py-4 animate-fade-in">
          <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-muted/50 text-muted-foreground shadow-sm border">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Loading conversation...</span>
          </div>
        </div>
      )}
      
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`flex max-w-3xl ${
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-full shrink-0 ${
                message.role === "user" ? "ml-4" : "mr-4"
              } ${
                message.role === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {message.role === "user" ? (
                <User size={16} />
              ) : (
                <Bot size={16} />
              )}
            </div>
            
            <div className="space-y-2">
              <div
                className={`px-4 py-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {message.content}
                  {message.isStreaming && (
                    <span className="inline-flex ml-2 items-center gap-1">
                      <span className="h-2 w-2 bg-current rounded-full animate-pulse" style={{ animationDelay: "0ms" }}></span>
                      <span className="h-2 w-2 bg-current rounded-full animate-pulse" style={{ animationDelay: "200ms" }}></span>
                      <span className="h-2 w-2 bg-current rounded-full animate-pulse" style={{ animationDelay: "400ms" }}></span>
                    </span>
                  )}
                </div>
                
                {message.role === "user" && message.has_image && (
                  <div className="flex items-center mt-2 text-xs border-t pt-2 border-primary-foreground/30">
                    <ImageIcon size={14} className="mr-1" />
                    <span>Image provided with this message</span>
                  </div>
                )}
              </div>
              
              {message.sources && message.sources.length > 0 && (
                <div className="px-4">
                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer font-medium">
                      Sources ({message.sources.length})
                    </summary>
                    <div className="mt-2 space-y-2">
                      {message.sources.map((source, idx) => (
                        <SourceItem key={idx} source={source} />
                      ))}
                    </div>
                  </details>
                </div>
              )}
              
              <div
                className={`text-xs text-muted-foreground px-4 ${
                  message.role === "user" ? "text-right" : "text-left"
                }`}
              >
                {formatDistanceToNow(new Date(message.created_at), {
                  addSuffix: true,
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

const SourceItem = ({ source }: { source: MessageSource }) => {
  return (
    <div className="border border-border rounded-md p-2">
      <div className="flex justify-between items-start">
        <div className="font-medium">{source.document_name}</div>
        <div className="text-xs">Page {source.page_number}</div>
      </div>
      <div className="text-xs mt-1 opacity-75 line-clamp-2">{source.content}</div>
    </div>
  );
};

export default MessageList;
