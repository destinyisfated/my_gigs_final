import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ReviewCard, Review } from "@/components/ReviewCard";
import { Briefcase, Eye, FileText, Upload, TrendingUp, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUser, useAuth } from "@clerk/clerk-react";
import { FreelancerDocumentsModal } from "@/components/FreelancerDocumentsModal";

interface Document {
  id: string;
  name: string;
  size: string;
  uploaded_at: string;
  file: string;
  title: string;
}

interface Profile {
  id: number;
  name: string;
  profession: string;
  email: string;
  phone: string;
  county: string;
  constituency: string;
  ward: string;
  bio: string;
  hourly_rate: number;
  years_experience: number;
  availability: string;
  skills: string[];
  avatar?: string;
}

const FreelancerDashboard = () => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5; // reviews per page

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // Load Profile and Documents
  useEffect(() => {
    const loadProfileAndDocs = async () => {
      if (!isLoaded || !user) return;

      try {
        setLoading(true);
        setError("");

        const token = await getToken({ template: "default" });
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch freelancer profile
        const profileRes = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/freelancers/me/`,
          { headers }
        );
        if (!profileRes.ok) throw new Error("Failed to load profile");
        const profileData = await profileRes.json();
        setProfile(profileData);

        // Fetch freelancer documents
        const docRes = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/freelancer-documents/`,
          { headers }
        );
        if (!docRes.ok) throw new Error("Failed to load documents");
        const docData = await docRes.json();
        setDocuments(Array.isArray(docData) ? docData : docData.results ?? []);
      } catch (err: any) {
        console.error("Dashboard load error:", err);
        setError(err.message || "Failed to load dashboard data");
        toast({
          title: "Error",
          description: err.message || "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfileAndDocs();
  }, [isLoaded, user, getToken]);

 
  // Load Reviews (with pagination)
  useEffect(() => {
    const loadReviews = async () => {
      if (!isLoaded || !user) return;

      try {
        const token = await getToken({ template: "default" });
        const headers = { Authorization: `Bearer ${token}` };

        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/freelancers/me/reviews/?page=${currentPage}&page_size=${pageSize}`,
          { headers }
        );
        if (!res.ok) throw new Error("Failed to load reviews");
        const data = await res.json();

        // Ensure data.results exists
        const results = Array.isArray(data.results) ? data.results : data;

        // Map backend data to ReviewCard format
        const formattedReviews: Review[] = results.map((r: any) => ({
          id: r.id.toString(),
          author: r.client_name,
          authorInitials: r.client_avatar,
          role: "Client",
          rating: r.rating,
          date: new Date(r.created_at).toLocaleDateString(),
          content: r.content,
          helpful: r.helpful_count,
          verified: true,
          replies: (r.replies?.map((reply: any) => ({
            id: reply.id.toString(),
            author: "Freelancer",
            authorInitials: profile ? profile.name.split(" ").map((n) => n[0]).join("") : "",
            date: new Date(reply.created_at).toLocaleDateString(),
            content: reply.content,
          })) || []),
        }));

        setReviews(formattedReviews);
        setTotalPages(Math.ceil(data.count / pageSize) || 1);
      } catch (err: any) {
        console.error("Failed to load reviews:", err);
        toast({
          title: "Error",
          description: err.message || "Failed to load reviews",
          variant: "destructive",
        });
      }
    };

    loadReviews();
  }, [currentPage, isLoaded, user, getToken, profile]);


  const handleDocumentsUpdated = (updatedDocuments: Document[]) => {
    setDocuments(updatedDocuments);
    setIsDocumentsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-2xl blur-3xl -z-10" />
            <div className="relative bg-card/50 backdrop-blur-sm p-8 rounded-2xl border-2 border-border">
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Welcome back, {profile?.name}
              </h1>
              <p className="text-muted-foreground text-md">
                Here's what's happening with your freelance work
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-secondary/50 bg-gradient-to-br from-card to-secondary/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Eye className="h-6 w-6 text-secondary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-1">—</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-500" />
                  <span className="text-green-600 dark:text-green-500 font-semibold">—</span>{" "}
                  this week
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-primary/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-1">{averageRating.toFixed(1)}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  Based on {reviews.length} reviews
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="documents" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 p-1 bg-muted/50 backdrop-blur-sm h-auto">
              <TabsTrigger value="documents" className="data-[state=active]:bg-card data-[state=active]:shadow-lg">
                Documents
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-card data-[state=active]:shadow-lg">
                Reviews
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-card data-[state=active]:shadow-lg">
                Profile
              </TabsTrigger>
            </TabsList>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-4 animate-fade-in">
              <div className="flex justify-end mb-4">
                <Button onClick={() => setIsDocumentsModalOpen(true)}>
                  Manage Documents
                </Button>
              </div>
              <div className="grid gap-4">
                {Array.isArray(documents) && documents.length > 0 ? (
                  documents.map((doc) => (
                    <Card key={doc.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-base">{doc.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.size} • Uploaded {doc.uploaded_at}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => window.open(doc.file, "_blank")}>
                          View
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground">No documents uploaded yet.</p>
                )}
              </div>
              {isDocumentsModalOpen && (
                <FreelancerDocumentsModal
                  documents={documents}
                  onClose={() => setIsDocumentsModalOpen(false)}
                  onDocumentsUpdated={handleDocumentsUpdated}
                />
              )}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-4 animate-fade-in">
              {reviews.length > 0 ? (
                <>
                  {reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      showReplyButton={true}
                      onHelpful={async (reviewId) => {
                        try {
                          const token = await getToken({ template: "default" });
                          const res = await fetch(
                            `${import.meta.env.VITE_API_BASE_URL}/reviews/${reviewId}/mark_helpful/`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          );
                          if (!res.ok) throw new Error("Failed to mark review as helpful");
                          // Update review locally
                          setReviews((prev) =>
                            prev.map((r) =>
                              r.id === reviewId ? { ...r, helpful: (r.helpful || 0) + 1 } : r
                            )
                          );
                        } catch (err: any) {
                          console.error(err);
                          toast({
                            title: "Error",
                            description: err.message || "Could not mark review as helpful",
                            variant: "destructive",
                          });
                        }
                      }}
                      onReply={async (reviewId, content) => {
                        try {
                          const token = await getToken({ template: "default" });
                          const res = await fetch(
                            `${import.meta.env.VITE_API_BASE_URL}/reviews/${reviewId}/add_reply/`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({ content }),
                            }
                          );
                          if (!res.ok) throw new Error("Failed to add reply");
                          const data = await res.json();
                          // Update review locally
                          setReviews((prev) =>
                            prev.map((r) =>
                              r.id === reviewId
                                ? { ...r, replies: [...(r.replies || []), data] }
                                : r
                            )
                          );
                          toast({
                            title: "Reply added",
                            description: "Your reply has been posted successfully",
                            variant: "default",
                          });
                        } catch (err: any) {
                          console.error(err);
                          toast({
                            title: "Error",
                            description: err.message || "Could not post reply",
                            variant: "destructive",
                          });
                        }
                      }}
                    />
                  ))}

                  {/* Pagination */}
                  <div className="flex justify-between mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    >
                      Previous
                    </Button>

                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    >
                      Next
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No reviews yet.</p>
              )}
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4 animate-fade-in">
              {profile && (
                <Card className="border-2">
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="flex items-start gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-lg">
                          {profile.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-1">{profile.name}</h3>
                          <p className="text-muted-foreground text-lg mb-4">{profile.profession}</p>
                          <Button variant="hero" asChild>
                            <Link to="/dashboard/freelancer/edit-profile">Edit Profile</Link>
                          </Button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 pt-6 border-t-2">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <p className="font-semibold">{profile.email}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Phone</label>
                          <p className="font-semibold">{profile.phone}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Location</label>
                          <p className="font-semibold">
                            {profile.county}, {profile.constituency}, {profile.ward}
                          </p>
                        </div>
                      </div>

                      <div className="pt-6 border-t-2">
                        <label className="text-sm font-medium text-muted-foreground block mb-2">Bio</label>
                        <p className="text-sm leading-relaxed">{profile.bio}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FreelancerDashboard;
