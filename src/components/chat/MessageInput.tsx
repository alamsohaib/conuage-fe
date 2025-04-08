
import { useState, FormEvent } from "react";
import { Send, Image as ImageIcon, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  onSendMessage: (content: string, image?: string | null) => Promise<void>;
  isLoading: boolean;
}

const MessageInput = ({ onSendMessage, isLoading }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && !image) return;
    
    try {
      await onSendMessage(message, image);
      setMessage("");
      setImage(null);
      setImageFile(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        handleSubmit(e);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImageFile(null);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-background px-4 py-3 border-t">
      <div className="max-w-3xl mx-auto">
        {image && (
          <div className="relative w-20 h-20 mb-2">
            <img 
              src={image} 
              alt="Uploaded image" 
              className="w-full h-full object-cover rounded-md" 
            />
            <button 
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-background border rounded-full p-1 hover:bg-muted"
            >
              <X size={14} />
            </button>
          </div>
        )}
        
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-muted rounded-md">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="min-h-[80px] resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
                disabled={isLoading || !!image}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={isLoading || !!image}
                asChild
              >
                <label htmlFor="image-upload" className="cursor-pointer">
                  <ImageIcon size={18} />
                </label>
              </Button>
            </div>
            
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || (!message.trim() && !image)}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default MessageInput;
