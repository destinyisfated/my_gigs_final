import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-2xl blur-3xl -z-10" />
            <div className="relative bg-card/50 backdrop-blur-sm p-8 rounded-2xl border-2 border-border">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">
                Platform overview and management
              </p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800/50 hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                  Total Users
                </CardTitle>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  15,234
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mt-2 gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-500" />
                  <span className="font-semibold text-green-600 dark:text-green-500">
                    +12.5%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800/50 hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                  Active Freelancers
                </CardTitle>
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  10,482
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mt-2 gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-500" />
                  <span className="font-semibold text-green-600 dark:text-green-500">
                    +8.2%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800/50 hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                  Total Jobs
                </CardTitle>
                <div className="w-12 h-12 rounded-full bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  8,945
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mt-2 gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-500" />
                  <span className="font-semibold text-green-600 dark:text-green-500">
                    +15.7%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800/50 hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                  Revenue (M-Pesa)
                </CardTitle>
                <div className="w-12 h-12 rounded-full bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  KSh 2.8M
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mt-2 gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-500" />
                  <span className="font-semibold text-green-600 dark:text-green-500">
                    +22.3%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="freelancers">Freelancers</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">User Management</h2>
                <Button variant="hero">Add User</Button>
              </div>

              <div className="grid gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                            U{i}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">User Name {i}</h3>
                            <p className="text-sm text-muted-foreground">
                              user{i}@example.com
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge
                              variant={i % 2 === 0 ? "default" : "secondary"}
                            >
                              {i % 2 === 0 ? "Client" : "Freelancer"}
                            </Badge>
                            <Badge variant="outline">Nairobi, Kenya</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Freelancers Tab */}
            <TabsContent value="freelancers" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Freelancer Verifications</h2>
                <div className="flex gap-2">
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    12 Approved
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />8 Pending
                  </Badge>
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />2 Rejected
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-xl font-semibold">
                            F{i}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">
                              Freelancer Name {i}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Web Developer • Nairobi, Kenya
                            </p>
                            <div className="flex gap-2 mb-3">
                              <Badge variant="secondary">KSh 250 Paid</Badge>
                              <Badge variant="outline">Documents: 3/3</Badge>
                            </div>
                            <p className="text-sm">
                              Applied on: Jan {15 + i}, 2024
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="default" size="sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button variant="ghost" size="sm">
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Jobs Tab */}
            <TabsContent value="jobs" className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">
                Job Listings Management
              </h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Job management interface coming soon
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">
                Payment Transactions (M-Pesa)
              </h2>

              <div className="grid gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <DollarSign className="h-10 w-10 rounded-full bg-primary/10 text-primary p-2" />
                          <div className="flex-1">
                            <h3 className="font-semibold">
                              Annual Freelancer Fee
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Transaction ID: MPESA{1000000 + i * 123}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">KSh 250</div>
                            <Badge variant="default" className="mt-1">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-4">
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Analytics & Reports</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                      <p className="text-muted-foreground">Chart placeholder</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                      <p className="text-muted-foreground">Chart placeholder</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
