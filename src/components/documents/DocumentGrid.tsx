
import React, { useEffect } from 'react';
import { Document } from "@/lib/types";
import { FileText, File, FileImage, FileSpreadsheet, FileDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import DocumentStatusBadge from "./DocumentStatusBadge";
import DocumentActions from "./DocumentActions";
import { Button } from "@/components/ui/button";

interface DocumentGridProps {
  documents: Document[];
  processingDocumentId: string | null;
  onEdit: (document: Document) => void;
  onProcess: (document: Document) => void;
  onDelete: (document: Document) => void;
  selectedDocuments: string[];
  onToggleSelect: (documentId: string) => void;
  onSelectAll: (select: boolean) => void;
  allSelected: boolean;
  someSelected?: boolean;
}

const DocumentGrid = ({ 
  documents, 
  processingDocumentId, 
  onEdit, 
  onProcess, 
  onDelete,
  selectedDocuments,
  onToggleSelect,
  onSelectAll,
  allSelected,
  someSelected = false
}: DocumentGridProps) => {

  useEffect(() => {
    const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
    
    const event = new CustomEvent('document-selection-change', { 
      detail: { selectedDocuments: selectedDocs } 
    });
    window.dispatchEvent(event);
  }, [selectedDocuments, documents]);

  const getDocumentIcon = (fileType: string | undefined) => {
    if (!fileType) return <File className="h-12 w-12" />;
    
    const type = fileType.toLowerCase();
    
    if (type.includes('pdf')) {
      return <FileDown className="h-12 w-12" />;
    } else if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) {
      return <FileImage className="h-12 w-12" />;
    } else if (type.includes('xls') || type.includes('sheet') || type.includes('csv')) {
      return <FileSpreadsheet className="h-12 w-12" />;
    } else {
      return <FileText className="h-12 w-12" />;
    }
  };

  return (
    <>
      <div className="mb-2 flex items-center">
        <div className="flex items-center">
          <Checkbox 
            checked={allSelected}
            data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
            onCheckedChange={(checked) => onSelectAll(!!checked)}
            aria-label="Select all documents"
            className={`mr-2 ${someSelected ? "opacity-60" : ""}`}
          />
          <span className="text-sm text-muted-foreground">
            {someSelected ? "Select all" : allSelected ? "Unselect all" : "Select all"}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {documents.map((document) => (
          <div 
            key={document.id}
            className="relative group border rounded-lg p-4 transition-all hover:shadow-md hover:border-primary/30 bg-card"
          >
            <div className="absolute top-2 right-2">
              <Checkbox 
                checked={selectedDocuments.includes(document.id)}
                onCheckedChange={() => onToggleSelect(document.id)}
                aria-label={`Select ${document.name}`}
                className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
            </div>
            
            <div className="flex flex-col items-center text-center mb-4">
              <div className="text-muted-foreground mb-2">
                {getDocumentIcon(document.file_type)}
              </div>
              <h3 
                className="text-sm font-medium line-clamp-2 mb-1 max-w-full truncate" 
                title={document.name}
              >
                {document.name}
              </h3>
              <div className="mt-1">
                <DocumentStatusBadge status={document.status} />
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1 mb-3">
              <div className="flex justify-between">
                <span>Pages:</span>
                <span className="font-medium">{document.page_count || "-"}</span>
              </div>
            </div>
            
            <div className="flex justify-center pt-2 border-t">
              <DocumentActions 
                document={document}
                onEdit={onEdit}
                onProcess={onProcess}
                onDelete={onDelete}
                isProcessing={processingDocumentId === document.id}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default DocumentGrid;
