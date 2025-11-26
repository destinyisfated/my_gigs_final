import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Briefcase,
  Heart,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  Star,
  TrendingUp,
} from "lucide-react";

// Only added this line
import { useUser } from "@clerk/clerk-react";

const ClientDashboard = () => {
  // Only added this line
  const { user, isLoaded } = useUser();

  // Only added this logic — safely gets the real user's name
  const userName = isLoaded
    ? user?.firstName
      ? `${user.firstName} ${user?.lastName || ""}`.trim()
      : user?.username ||
        user?.primaryEmailAddress?.emailAddress.split("@")[0] ||
        "Client"
    : "Welcome";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header - ONLY THIS PART CHANGED */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-2xl blur-3xl -z-10" />
            <div className="relative bg-card/50 backdrop-blur-sm p-8 rounded-2xl border-2 border-border ">
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Welcome back, {user.firstName}
              </h1>
              <p className="text-muted-foreground text-md">
                Manage your projects and find talented freelancers
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900/50 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                  Your Active Projects
                </CardTitle>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  5
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 border-rose-200 dark:border-rose-900/50 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                  Saved Freelancers
                </CardTitle>
                <div className="w-10 h-10 rounded-full bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-rose-600 dark:text-rose-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  18
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button variant="hero" size="lg">
              <Search className="mr-2 h-4 w-4" />
              Find Freelancers
            </Button>
            <Button variant="outline" size="lg">
              <Briefcase className="mr-2 h-4 w-4" />
              Post a Job
            </Button>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="projects" className="space-y-6 ">
            <TabsList>
              <TabsTrigger value="projects">My Projects</TabsTrigger>
              <TabsTrigger value="saved">Saved Freelancers</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">My Projects</h2>
                <Button variant="hero">
                  <Briefcase className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </div>

              <div className="grid gap-4">
                {[
                  {
                    title: "E-commerce Website Development",
                    status: "In Progress",
                    freelancer: "Sarah Wanjiku",
                    budget: "$3,500",
                    deadline: "Feb 28, 2024",
                    progress: 65,
                  },
                  {
                    title: "Mobile App UI Design",
                    status: "Review",
                    freelancer: "Michael Ochieng",
                    budget: "$2,000",
                    deadline: "Feb 15, 2024",
                    progress: 90,
                  },
                  {
                    title: "Content Writing - Blog Posts",
                    status: "Completed",
                    freelancer: "Grace Muthoni",
                    budget: "$800",
                    deadline: "Jan 30, 2024",
                    progress: 100,
                  },
                ].map((project, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              {project.title}
                            </h3>
                            <Badge
                              variant={
                                project.status === "Completed"
                                  ? "default"
                                  : project.status === "In Progress"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {project.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <span>Freelancer: {project.freelancer}</span>
                            <span>•</span>
                            <span>Budget: {project.budget}</span>
                            <span>•</span>
                            <span>Due: {project.deadline}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Progress
                              </span>
                              <span className="font-medium">
                                {project.progress}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Saved Freelancers Tab */}
            <TabsContent value="saved" className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Saved Freelancers</h2>

              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-xl font-bold flex-shrink-0">
                          F{i}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg mb-1">
                            Freelancer Name {i}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Web Developer
                          </p>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 fill-accent text-accent" />
                            <span className="font-semibold">4.9</span>
                            <span className="text-sm text-muted-foreground">
                              (45 reviews)
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Heart className="h-4 w-4 fill-primary text-primary" />
                        </Button>
                      </div>

                      <div className="flex gap-2 mb-4">
                        <Badge variant="secondary">React</Badge>
                        <Badge variant="secondary">Node.js</Badge>
                        <Badge variant="secondary">AWS</Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="hero" className="flex-1" size="sm">
                          View Profile
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Messages</h2>

              <div className="grid gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card
                    key={i}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-secondary-foreground font-semibold">
                          FL
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-semibold">
                              Freelancer Name {i}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              {i}h ago
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Thanks for reaching out! I'd love to discuss your
                            project in more detail...
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              E-commerce Project
                            </Badge>
                            {i <= 2 && (
                              <Badge variant="default" className="text-xs">
                                Unread
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Project History</h2>

              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <h3 className="font-semibold text-lg">
                              Completed Project {i}
                            </h3>
                            <Badge variant="outline">Completed</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Completed on Jan {20 - i}, 2024</span>
                            </div>
                            <span>•</span>
                            <span>Freelancer: John Kamau</span>
                            <span>•</span>
                            <span>Total: $1,500</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Your Rating:</span>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className="h-4 w-4 fill-accent text-accent"
                              />
                            ))}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ClientDashboard;
