
import { useState, useRef, useCallback, useEffect } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, X, FileText, AlertCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface UploadDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
  onSuccess: () => void;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  error?: string;
  status: 'pending' | 'uploading' | 'error' | 'success';
}

const UploadDocumentDialog = ({ 
  isOpen, 
  onClose, 
  folderId, 
  onSuccess 
}: UploadDocumentDialogProps) => {
  const [documentName, setDocumentName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const generateId = () => Math.random().toString(36).substring(2, 10);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    
    const newUploadFiles: UploadFile[] = Array.from(newFiles).map(file => ({
      file,
      id: generateId(),
      progress: 0,
      status: 'pending'
    }));
    
    setFiles(prev => [...prev, ...newUploadFiles]);
    
    if (!documentName && newUploadFiles.length > 0) {
      const fileName = newUploadFiles[0].file.name.split('.')[0];
      setDocumentName(fileName);
    }
  }, [documentName]);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
      file.type === 'application/pdf'
    );
    
    if (droppedFiles.length === 0) {
      toast.error("Only PDF files are allowed");
      return;
    }
    
    addFiles(droppedFiles as unknown as FileList);
  }, [addFiles]);
  
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [addFiles]);
  
  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  }, []);
  
  const reset = () => {
    setDocumentName("");
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (isSubmitting) {
      const confirmed = window.confirm("Upload in progress. Are you sure you want to cancel?");
      if (!confirmed) return;
    }
    reset();
    onClose();
  };

  const allFilesUploaded = files.length > 0 && files.every(f => f.status === 'success');
  
  useEffect(() => {
    if (allFilesUploaded && files.length > 0) {
      onSuccess();
      handleClose();
    }
  }, [allFilesUploaded, files.length, onSuccess]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentName.trim()) {
      toast.error("Document name is required");
      return;
    }
    
    if (files.length === 0) {
      toast.error("Please select at least one file to upload");
      return;
    }
    
    if (!folderId) {
      toast.error("No folder selected for upload");
      return;
    }
    
    setIsSubmitting(true);
    let successCount = 0;
    
    for (const fileItem of files) {
      if (fileItem.status === 'success') {
        successCount++;
        continue;
      }
      
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'uploading' } : f
      ));
      
      try {
        const formData = new FormData();
        formData.append("name", files.length === 1 ? documentName.trim() : fileItem.file.name);
        formData.append("folder_id", folderId);
        formData.append("file", fileItem.file);
        
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id && f.progress < 90 ? { ...f, progress: f.progress + 10 } : f
          ));
        }, 300);
        
        const response = await fetch(`https://conuage-be-187523307981.us-central1.run.app/api/v1/document-management/documents/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: formData,
        });
        
        clearInterval(progressInterval);
        
        const responseData = await response.json();
        
        if (!response.ok) {
          console.error("Upload failed:", responseData);
          throw new Error(responseData.detail || "Upload failed");
        }
        
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, progress: 100, status: 'success' } : f
        ));
        
        successCount++;
      } catch (error) {
        console.error("Upload error:", error);
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, error: (error as Error).message, status: 'error' } : f
        ));
      }
    }
    
    if (successCount > 0) {
      toast.success(`${successCount} document${successCount > 1 ? 's' : ''} uploaded successfully`);
      window.dispatchEvent(new Event('refresh-documents'));
    }
    
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="dark:text-white">Upload Documents</DialogTitle>
            <DialogDescription className="dark:text-white/80">
              Upload documents to the selected folder. You can upload multiple files at once.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {files.length <= 1 && (
              <div className="grid gap-2">
                <Label htmlFor="documentName" className="dark:text-white/80">Document Name</Label>
                <Input
                  id="documentName"
                  placeholder="Enter document name"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  className="dark:bg-gray-800 dark:text-white"
                />
              </div>
            )}
            
            <div className="grid gap-2">
              <Label className="dark:text-white/80">Files</Label>
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Input
                  id="file"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                  accept=".pdf,application/pdf"
                />
                
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground dark:text-white/70" />
                  <p className="text-sm font-medium dark:text-white/80">
                    Drag files here or <Button type="button" variant="link" className="p-0 h-auto dark:text-white/80 hover:dark:text-white" onClick={() => fileInputRef.current?.click()}>browse</Button>
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-white/60">
                    Please add your pdf documents
                  </p>
                </div>
              </div>
              
              {files.length > 0 && (
                <div className="mt-4 space-y-3 max-h-[200px] overflow-y-auto">
                  {files.map((fileItem) => (
                    <div 
                      key={fileItem.id}
                      className={`flex items-center justify-between p-3 border rounded-lg ${
                        fileItem.status === 'error' ? 'border-destructive/50 bg-destructive/5' : 
                        fileItem.status === 'success' ? 'border-green-500/50 bg-green-500/5' : 
                        'border-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className={`h-5 w-5 ${
                          fileItem.status === 'error' ? 'text-destructive' : 
                          fileItem.status === 'success' ? 'text-green-500' : 
                          'text-muted-foreground dark:text-white/70'
                        }`} />
                        
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium truncate dark:text-white" title={fileItem.file.name}>
                            {fileItem.file.name}
                          </p>
                          <div className="text-xs text-muted-foreground dark:text-white/60">
                            {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {fileItem.status === 'uploading' && (
                          <div className="w-16">
                            <Progress value={fileItem.progress} className="h-1" />
                          </div>
                        )}
                        
                        {fileItem.status === 'error' && (
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-destructive mr-1" />
                            <span className="text-xs text-destructive dark:text-red-400">Failed</span>
                          </div>
                        )}
                        
                        {fileItem.status === 'success' && (
                          <span className="text-xs text-green-500">Uploaded</span>
                        )}
                        
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 dark:text-white/80 hover:dark:text-white" 
                          disabled={isSubmitting && fileItem.status === 'uploading'}
                          onClick={() => removeFile(fileItem.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="dark:text-white/80 hover:dark:text-white"
            >
              {allFilesUploaded ? "Done" : "Cancel"}
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || files.length === 0 || allFilesUploaded}
              className="gap-2 dark:text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload {files.length > 0 ? `${files.length} File${files.length > 1 ? 's' : ''}` : 'Document'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentDialog;
