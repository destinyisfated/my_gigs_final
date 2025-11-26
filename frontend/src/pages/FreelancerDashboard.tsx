import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ReviewCard, Review } from "@/components/ReviewCard";
import {
  Briefcase,
  Eye,
  FileText,
  Upload,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  Star,
  MessageSquare,
} from "lucide-react";

// Import Clerk to get the real user
import { useUser } from "@clerk/clerk-react";

const mockReviews: Review[] = [
  {
    id: "1",
    author: "Sarah Wanjiku",
    authorInitials: "SW",
    role: "Marketing Manager",
    rating: 5,
    date: "2 days ago",
    content:
      "Excellent work! Professional and delivered on time. Highly recommend!",
    helpful: 12,
    verified: true,
  },
  {
    id: "2",
    author: "Michael Ochieng",
    authorInitials: "MO",
    role: "Startup Founder",
    rating: 5,
    date: "1 week ago",
    content: "Best freelancer I've worked with. Will hire again!",
    helpful: 8,
    verified: true,
  },
];

const FreelancerDashboard = () => {
  const [reviews] = useState<Review[]>(mockReviews);
  const { user, isLoaded } = useUser(); // Get real user from Clerk

  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  // This is the ONLY change: real user name instead of "John"
  const userName = isLoaded
    ? user?.firstName
      ? `${user.firstName} ${user?.lastName || ""}`.trim()
      : user?.length > 0
      ? `${user.firstName} ${user?.lastName || ""}`.trim()
      : user?.username ||
        user?.primaryEmailAddress?.emailAddress.split("@")[0] ||
        "Freelancer"
    : "Welcome";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header with Gradient */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-2xl blur-3xl -z-10" />
            <div className="relative bg-card/50 backdrop-blur-sm p-8 rounded-2xl border-2 border-border">
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Welcome back, {user.firstName}
              </h1>
              <p className="text-muted-foreground text-md">
                Here's what's happening with your freelance work
              </p>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-primary/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Jobs
                </CardTitle>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-1">12</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-500" />
                  <span className="text-green-600 dark:text-green-500 font-semibold">
                    +2
                  </span>{" "}
                  from last month
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-secondary/50 bg-gradient-to-br from-card to-secondary/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Profile Views
                </CardTitle>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Eye className="h-6 w-6 text-secondary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-1">1,284</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-500" />
                  <span className="text-green-600 dark:text-green-500 font-semibold">
                    +18%
                  </span>{" "}
                  this week
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-primary/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Rating
                </CardTitle>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-1">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  Based on {reviews.length} reviews
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Tabs */}
          <Tabs defaultValue="jobs" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 p-1 bg-muted/50 backdrop-blur-sm h-auto">
              <TabsTrigger
                value="jobs"
                className="data-[state=active]:bg-card data-[state=active]:shadow-lg"
              >
                My Jobs
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="data-[state=active]:bg-card data-[state=active]:shadow-lg"
              >
                Documents
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:bg-card data-[state=active]:shadow-lg"
              >
                Reviews
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-card data-[state=active]:shadow-lg"
              >
                Profile
              </TabsTrigger>
            </TabsList>

            {/* Jobs Tab */}
            <TabsContent value="jobs" className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold">Posted Jobs</h2>
                  <p className="text-muted-foreground">
                    Manage your active job listings
                  </p>
                </div>
                <Button variant="hero" size="lg" className="gap-2">
                  <Briefcase className="h-5 w-5" />
                  Post New Job
                </Button>
              </div>

              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card
                    key={i}
                    className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/30"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                            Full Stack Web Development Project
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Looking for an experienced developer to build a
                            modern web application with React and Node.js...
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <DollarSign className="h-4 w-4 text-accent" />
                              <span className="font-semibold">
                                $2,500 - $3,500
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Users className="h-4 w-4 text-primary" />
                              <span className="font-semibold">8 proposals</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4 text-secondary" />
                              Posted 2 days ago
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" className="ml-4">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent
              value="documents"
              className="space-y-y-4 animate-fade-in"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold">My Documents</h2>
                  <p className="text-muted-foreground">
                    Upload and manage your credentials
                  </p>
                </div>
                <Button variant="hero" size="lg" className="gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Document
                </Button>
              </div>

              <div className="grid gap-4">
                {[
                  {
                    name: "Degree Certificate.pdf",
                    size: "2.4 MB",
                    date: "Jan 15, 2024",
                  },
                  {
                    name: "Portfolio.pdf",
                    size: "5.1 MB",
                    date: "Jan 10, 2024",
                  },
                  {
                    name: "ID Document.pdf",
                    size: "1.2 MB",
                    date: "Dec 20, 2023",
                  },
                ].map((doc) => (
                  <Card
                    key={doc.name}
                    className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-base">
                              {doc.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {doc.size} • Uploaded {doc.date}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold">Client Reviews</h2>
                  <p className="text-muted-foreground">
                    {reviews.length} reviews • {averageRating.toFixed(1)}{" "}
                    average rating
                  </p>
                </div>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/freelancer/1/reviews">View All Reviews</Link>
                </Button>
              </div>

              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    showReplyButton={false}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold">My Profile</h2>
                  <p className="text-muted-foreground">
                    Manage your profile information
                  </p>
                </div>
              </div>

              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="flex items-start gap-6">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-lg">
                        JD
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-1">John Doe</h3>
                        <p className="text-muted-foreground text-lg mb-4">
                          Full Stack Developer
                        </p>
                        <Button variant="hero" asChild>
                          <Link to="/dashboard/freelancer/edit-profile">
                            Edit Profile
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-6 border-t-2">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">
                          Email
                        </label>
                        <p className="font-semibold">john.doe@example.com</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">
                          Phone
                        </label>
                        <p className="font-semibold">+254 712 345 678</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">
                          Location
                        </label>
                        <p className="font-semibold">Nairobi, Kenya</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">
                          Member Since
                        </label>
                        <p className="font-semibold">January 2024</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t-2">
                      <label className="text-sm font-medium text-muted-foreground block mb-2">
                        Bio
                      </label>
                      <p className="text-sm leading-relaxed">
                        Experienced full stack developer with 5+ years of
                        experience building web applications. Specialized in
                        React, Node.js, and cloud technologies. Passionate about
                        creating scalable and user-friendly solutions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FreelancerDashboard;
