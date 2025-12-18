import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  X,
  Image as ImageIcon,
  File,
  CheckCircle,
  AlertCircle,
  Loader2,
  Cloud,
  Shield,
  Sparkles,
  FileCheck,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  progress?: number;
  status?: "uploading" | "completed" | "error";
}

interface DocumentUploadProps {
  documents: UploadedDocument[];
  onDocumentsChange: (documents: UploadedDocument[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  className?: string;
}

/*
╔══════════════════════════════════════════════════════════════════════════════╗
║                      DOCUMENT UPLOAD BACKEND                                  ║
║                     Django Integration Guide                                  ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────────────┐
│ API ENDPOINTS                                                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ POST /api/freelancers/documents/upload/                                      │
│                                                                              │
│ Headers:                                                                     │
│   Authorization: Bearer <clerk_jwt_token>                                    │
│   Content-Type: multipart/form-data                                          │
│                                                                              │
│ Request Body (FormData):                                                     │
│   file: File                                                                 │
│   document_type: 'certificate' | 'portfolio' | 'id_document' | 'other'       │
│                                                                              │
│ Response:                                                                    │
│ {                                                                            │
│   "id": 123,                                                                 │
│   "name": "certificate.pdf",                                                 │
│   "file_type": "application/pdf",                                            │
│   "file_size": 102400,                                                       │
│   "url": "https://storage.example.com/docs/certificate.pdf",                 │
│   "document_type": "certificate",                                            │
│   "is_verified": false,                                                      │
│   "uploaded_at": "2024-01-15T10:30:00Z"                                      │
│ }                                                                            │
│                                                                              │
│ DELETE /api/freelancers/documents/{id}/                                      │
│                                                                              │
│ Headers:                                                                     │
│   Authorization: Bearer <clerk_jwt_token>                                    │
│                                                                              │
│ Response:                                                                    │
│ { "success": true, "message": "Document deleted" }                           │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ DJANGO MODEL                                                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ # freelancers/models.py                                                      │
│                                                                              │
│ from django.db import models                                                 │
│ import os                                                                    │
│                                                                              │
│ def document_upload_path(instance, filename):                                │
│     """Generate unique upload path for document"""                           │
│     ext = filename.split('.')[-1]                                            │
│     filename = f'{instance.freelancer.id}_{uuid.uuid4().hex[:8]}.{ext}'      │
│     return f'freelancer_documents/{instance.freelancer.id}/{filename}'       │
│                                                                              │
│ class FreelancerDocument(models.Model):                                      │
│     """Documents uploaded by freelancers"""                                  │
│                                                                              │
│     class DocumentType(models.TextChoices):                                  │
│         CERTIFICATE = 'certificate', 'Certificate'                           │
│         PORTFOLIO = 'portfolio', 'Portfolio'                                 │
│         ID_DOCUMENT = 'id_document', 'ID Document'                           │
│         OTHER = 'other', 'Other'                                             │
│                                                                              │
│     freelancer = models.ForeignKey(                                          │
│         'FreelancerProfile',                                                 │
│         on_delete=models.CASCADE,                                            │
│         related_name='documents'                                             │
│     )                                                                        │
│     name = models.CharField(max_length=255)                                  │
│     file = models.FileField(upload_to=document_upload_path)                  │
│     file_type = models.CharField(max_length=100)                             │
│     file_size = models.PositiveIntegerField()  # bytes                       │
│     document_type = models.CharField(                                        │
│         max_length=20,                                                       │
│         choices=DocumentType.choices,                                        │
│         default=DocumentType.OTHER                                           │
│     )                                                                        │
│     is_verified = models.BooleanField(default=False)                         │
│     verified_at = models.DateTimeField(null=True, blank=True)                │
│     verified_by = models.ForeignKey(                                         │
│         'auth.User',                                                         │
│         on_delete=models.SET_NULL,                                           │
│         null=True,                                                           │
│         blank=True                                                           │
│     )                                                                        │
│     uploaded_at = models.DateTimeField(auto_now_add=True)                    │
│                                                                              │
│     class Meta:                                                              │
│         ordering = ['-uploaded_at']                                          │
│                                                                              │
│     def delete(self, *args, **kwargs):                                       │
│         # Delete file from storage                                           │
│         if self.file:                                                        │
│             self.file.delete(save=False)                                     │
│         super().delete(*args, **kwargs)                                      │
│                                                                              │
│     @property                                                                │
│     def url(self):                                                           │
│         return self.file.url if self.file else None                          │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ DJANGO VIEW                                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ # freelancers/views.py                                                       │
│                                                                              │
│ from rest_framework.views import APIView                                     │
│ from rest_framework.parsers import MultiPartParser, FormParser               │
│ from rest_framework.permissions import IsAuthenticated                       │
│ from rest_framework.response import Response                                 │
│ from django.conf import settings                                             │
│ from .models import FreelancerDocument                                       │
│                                                                              │
│ MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB                                       │
│ ALLOWED_TYPES = [                                                            │
│     'application/pdf',                                                       │
│     'image/jpeg',                                                            │
│     'image/png',                                                             │
│     'image/webp',                                                            │
│     'application/msword',                                                    │
│     'application/vnd.openxmlformats-officedocument.wordprocessingml.document'│
│ ]                                                                            │
│                                                                              │
│ class DocumentUploadView(APIView):                                           │
│     """Handle document uploads for freelancers"""                            │
│     parser_classes = [MultiPartParser, FormParser]                           │
│     permission_classes = [IsAuthenticated]                                   │
│                                                                              │
│     def post(self, request):                                                 │
│         file = request.FILES.get('file')                                     │
│         document_type = request.data.get('document_type', 'other')           │
│                                                                              │
│         if not file:                                                         │
│             return Response({'error': 'No file provided'}, status=400)       │
│                                                                              │
│         # Validate file size                                                 │
│         if file.size > MAX_FILE_SIZE:                                        │
│             return Response({                                                │
│                 'error': f'File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB'│
│             }, status=400)                                                   │
│                                                                              │
│         # Validate file type                                                 │
│         if file.content_type not in ALLOWED_TYPES:                           │
│             return Response({                                                │
│                 'error': 'File type not supported'                           │
│             }, status=400)                                                   │
│                                                                              │
│         # Get freelancer profile                                             │
│         try:                                                                 │
│             profile = request.user.freelancer_profile                        │
│         except:                                                              │
│             return Response({'error': 'Freelancer profile not found'}, status=404)│
│                                                                              │
│         # Check document limit                                               │
│         if profile.documents.count() >= 10:                                  │
│             return Response({                                                │
│                 'error': 'Maximum 10 documents allowed'                      │
│             }, status=400)                                                   │
│                                                                              │
│         # Create document                                                    │
│         doc = FreelancerDocument.objects.create(                             │
│             freelancer=profile,                                              │
│             name=file.name,                                                  │
│             file=file,                                                       │
│             file_type=file.content_type,                                     │
│             file_size=file.size,                                             │
│             document_type=document_type                                      │
│         )                                                                    │
│                                                                              │
│         return Response({                                                    │
│             'id': doc.id,                                                    │
│             'name': doc.name,                                                │
│             'file_type': doc.file_type,                                      │
│             'file_size': doc.file_size,                                      │
│             'url': doc.url,                                                  │
│             'document_type': doc.document_type,                              │
│             'is_verified': doc.is_verified,                                  │
│             'uploaded_at': doc.uploaded_at.isoformat()                       │
│         }, status=201)                                                       │
│                                                                              │
│                                                                              │
│ class DocumentDeleteView(APIView):                                           │
│     """Delete a document"""                                                  │
│     permission_classes = [IsAuthenticated]                                   │
│                                                                              │
│     def delete(self, request, document_id):                                  │
│         try:                                                                 │
│             doc = FreelancerDocument.objects.get(                            │
│                 id=document_id,                                              │
│                 freelancer__user=request.user                                │
│             )                                                                │
│         except FreelancerDocument.DoesNotExist:                              │
│             return Response({'error': 'Document not found'}, status=404)     │
│                                                                              │
│         doc.delete()                                                         │
│         return Response({'success': True, 'message': 'Document deleted'})    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ DJANGO URLS                                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ # freelancers/urls.py                                                        │
│                                                                              │
│ from django.urls import path                                                 │
│ from .views import DocumentUploadView, DocumentDeleteView                    │
│                                                                              │
│ urlpatterns = [                                                              │
│     path('documents/upload/', DocumentUploadView.as_view(), name='doc-upload'),│
│     path('documents/<int:document_id>/', DocumentDeleteView.as_view(), name='doc-delete'),│
│ ]                                                                            │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
*/

export function DocumentUpload({
  documents,
  onDocumentsChange,
  maxFiles = 10,
  maxSizeMB = 5,
  acceptedTypes = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"],
  className = "",
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/"))
      return <ImageIcon className="h-5 w-5 text-primary" />;
    if (type.includes("pdf"))
      return <FileText className="h-5 w-5 text-destructive" />;
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  const validateFile = (file: File): string | null => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File ${file.name} exceeds ${maxSizeMB}MB limit`;
    }

    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedTypes.some((type) => type.toLowerCase() === extension)) {
      return `File type ${extension} is not supported`;
    }

    return null;
  };

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      if (documents.length + fileArray.length > maxFiles) {
        toast({
          title: "Too many files",
          description: `You can upload maximum ${maxFiles} documents`,
          variant: "destructive",
        });
        return;
      }

      setUploading(true);
      const newDocuments: UploadedDocument[] = [];

      for (const file of fileArray) {
        const error = validateFile(file);
        if (error) {
          toast({
            title: "Upload Error",
            description: error,
            variant: "destructive",
          });
          continue;
        }

        // ============= Real Implementation =============
        // const formData = new FormData();
        // formData.append('file', file);
        // formData.append('document_type', 'other');
        //
        // const token = await getToken();
        // const response = await fetch(`${API_URL}/api/freelancers/documents/upload/`, {
        //   method: 'POST',
        //   headers: { Authorization: `Bearer ${token}` },
        //   body: formData,
        // });
        //
        // const data = await response.json();
        // newDocuments.push({
        //   id: data.id,
        //   name: data.name,
        //   type: data.file_type,
        //   size: data.file_size,
        //   url: data.url,
        //   uploadedAt: new Date(data.uploaded_at),
        //   status: 'completed'
        // });
        // ================================================

        // Simulation with progress
        await new Promise((resolve) => setTimeout(resolve, 800));
        newDocuments.push({
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          uploadedAt: new Date(),
          status: "completed",
        });
      }

      onDocumentsChange([...documents, ...newDocuments]);
      setUploading(false);

      if (newDocuments.length > 0) {
        toast({
          title: "Upload Successful",
          description: `${newDocuments.length} document(s) uploaded`,
        });
      }
    },
    [documents, maxFiles, maxSizeMB, acceptedTypes, onDocumentsChange]
  );

  const removeDocument = (id: string) => {
    onDocumentsChange(documents.filter((doc) => doc.id !== id));
    toast({ title: "Document Removed" });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className={className}>
      {/* Drop Zone */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-2xl p-6 md:p-8 transition-all duration-300 cursor-pointer overflow-hidden
          ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border/50 hover:border-primary/50 hover:bg-muted/30"
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />

        <div className="relative flex flex-col items-center justify-center text-center">
          <motion.div
            className={`
              w-20 h-20 rounded-2xl flex items-center justify-center mb-5 relative
              ${
                isDragging
                  ? "bg-primary text-primary-foreground"
                  : "bg-gradient-to-br from-primary/20 to-accent/20"
              }
            `}
            animate={{ scale: isDragging ? 1.1 : 1 }}
          >
            {uploading ? (
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            ) : (
              <Cloud
                className={`h-10 w-10 ${isDragging ? "" : "text-primary"}`}
              />
            )}
            {!uploading && (
              <motion.div
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-accent flex items-center justify-center shadow-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Upload className="h-4 w-4 text-accent-foreground" />
              </motion.div>
            )}
          </motion.div>

          <h3 className="text-lg font-semibold text-foreground mb-2">
            {uploading
              ? "Uploading..."
              : isDragging
              ? "Drop files here"
              : "Upload Documents"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            Drag & drop your certificates, portfolio samples, or ID documents
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline" className="bg-background/50 text-xs">
              Max {maxSizeMB}MB per file
            </Badge>
            <Badge variant="outline" className="bg-background/50 text-xs">
              PDF, Images, Docs
            </Badge>
            <Badge variant="outline" className="bg-background/50 text-xs">
              Up to {maxFiles} files
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Uploaded Documents */}
      <AnimatePresence>
        {documents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-primary" />
                Uploaded Documents ({documents.length}/{maxFiles})
              </h4>
              <Badge variant="success" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ready
              </Badge>
            </div>

            <div className="grid gap-2">
              {documents.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-gradient-to-r from-muted/40 to-muted/20 border border-border/50 hover:bg-muted/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-background border border-border/50 flex items-center justify-center shrink-0">
                      {getFileIcon(doc.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate pr-2">
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(doc.size)}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDocument(doc.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Notice */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-5 p-4 rounded-xl bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/20"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="font-medium text-foreground mb-1 flex items-center gap-2">
              Document Guidelines
              <Sparkles className="h-4 w-4 text-accent" />
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Upload certificates, portfolio samples, and ID documents
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Verified documents increase client trust
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                All documents are stored securely with encryption
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
