
import { Message, MessageSource } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { User, Bot, Image as ImageIcon } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

const MessageList = ({ messages, isLoading }: MessageListProps) => {
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Bot size={64} className="text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
        <p className="text-muted-foreground max-w-md">
          Send a message to start chatting with the AI assistant.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 pb-6">
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
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                {/* Image indicator for user messages with images */}
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
      
      {isLoading && (
        <div className="flex justify-start">
          <div className="flex flex-row max-w-3xl">
            <div className="flex items-center justify-center h-8 w-8 rounded-full shrink-0 mr-4 bg-muted text-muted-foreground">
              <Bot size={16} />
            </div>
            <div className="px-4 py-3 rounded-lg bg-muted text-foreground">
              <div className="flex space-x-2">
                <div className="h-3 w-3 bg-foreground/20 rounded-full animate-bounce"></div>
                <div className="h-3 w-3 bg-foreground/20 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-3 w-3 bg-foreground/20 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
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
