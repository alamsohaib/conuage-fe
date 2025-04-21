import { FileText } from "lucide-react";
import { Document } from "@/lib/types";
import DocumentStatusBadge from "./DocumentStatusBadge";
import DocumentActions from "./DocumentActions";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect } from "react";

interface DocumentTableProps {
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
  totalDocuments?: number;
  currentPageDocuments?: number;
}

const DocumentTable = ({ 
  documents, 
  processingDocumentId, 
  onEdit, 
  onProcess, 
  onDelete,
  selectedDocuments,
  onToggleSelect,
  onSelectAll,
  allSelected,
  someSelected = false,
  totalDocuments,
  currentPageDocuments
}: DocumentTableProps) => {
  useEffect(() => {
    const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
    
    const event = new CustomEvent('document-selection-change', { 
      detail: { selectedDocuments: selectedDocs } 
    });
    window.dispatchEvent(event);
  }, [selectedDocuments, documents]);

  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 w-[50px] px-4 text-left align-middle">
                <Checkbox 
                  checked={allSelected} 
                  data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                  aria-label="Select all documents"
                  className={someSelected ? "opacity-60" : ""}
                />
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Pages</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {documents.map((document) => (
              <tr 
                key={document.id} 
                className={`border-b transition-colors hover:bg-muted/50 ${selectedDocuments.includes(document.id) ? 'bg-muted/30' : ''}`}
              >
                <td className="p-4 align-middle">
                  <Checkbox 
                    checked={selectedDocuments.includes(document.id)}
                    onCheckedChange={() => onToggleSelect(document.id)}
                    aria-label={`Select ${document.name}`}
                  />
                </td>
                <td className="p-4 align-middle">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">{document.name}</span>
                  </div>
                </td>
                <td className="p-4 align-middle">{document.page_count}</td>
                <td className="p-4 align-middle">
                  <DocumentStatusBadge status={document.status} />
                </td>
                <td className="p-4 align-middle">
                  <DocumentActions 
                    document={document}
                    onEdit={onEdit}
                    onProcess={onProcess}
                    onDelete={onDelete}
                    isProcessing={processingDocumentId === document.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentTable;
