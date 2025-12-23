import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FileText, Trash2, Eye, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@clerk/clerk-react";

interface Document {
  id: number;
  file: string;
  title: string;
  document_type: string;
  uploaded_at: string;
  is_verified: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function FreelancerDocumentsModal({ open, onClose }: Props) {
  const { getToken } = useAuth();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("other");
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;

  // ✅ FIXED: safely handle paginated responses
  const loadDocuments = async () => {
    try {
      const token = await getToken();

      const res = await fetch(`${API}/freelancer-documents/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      // 🔑 CRITICAL FIX
      setDocuments(Array.isArray(data) ? data : data.results ?? []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (open) {
      loadDocuments();
    }
  }, [open]);

  const uploadDocument = async () => {
    if (!file || !title) {
      toast({
        title: "Missing fields",
        description: "Please provide a title and file",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("document_type", documentType);

      const res = await fetch(`${API}/freelancer-documents/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error();

      toast({ title: "Document uploaded" });
      setFile(null);
      setTitle("");
      setDocumentType("other");
      loadDocuments();
    } catch {
      toast({
        title: "Upload failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: number) => {
    try {
      const token = await getToken();

      await fetch(`${API}/freelancer-documents/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      loadDocuments();
    } catch {
      toast({
        title: "Delete failed",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>My Documents</DialogTitle>
          <DialogDescription>
            Upload and manage your verification documents
          </DialogDescription>
        </DialogHeader>

        {/* Upload */}
        <div className="grid md:grid-cols-3 gap-4">
          <Input
            placeholder="Document title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger>
              <SelectValue placeholder="Document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">National ID</SelectItem>
              <SelectItem value="certificate">Certificate</SelectItem>
              <SelectItem value="portfolio">Portfolio</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <Button className="mt-4 gap-2" onClick={uploadDocument} disabled={loading}>
          <Upload className="h-4 w-4" />
          Upload
        </Button>

        {/* Documents list */}
        <div className="mt-6 space-y-3">
          {documents.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No documents uploaded yet
            </p>
          )}

          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between border rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.document_type} •{" "}
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="icon" variant="ghost" asChild>
                  <a href={doc.file} target="_blank" rel="noreferrer">
                    <Eye className="h-4 w-4" />
                  </a>
                </Button>

                {!doc.is_verified && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteDocument(doc.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
