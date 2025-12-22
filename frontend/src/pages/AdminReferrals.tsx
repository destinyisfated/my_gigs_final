import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  referralApi,
  type Referral,
  type SalesPerson,
  type AdminOverview,
} from "@/lib/referral-api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  Trophy,
  Plus,
  UserPlus,
  Shield,
  Eye,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import { CreateSalesAccountModal } from "@/components/CreateSalesAccountModal";
import { motion } from "framer-motion";

// ============================================
// DJANGO + CLERK BACKEND INTEGRATION - ADMIN DASHBOARD
// ============================================
//
// AUTHENTICATION & PERMISSIONS:
// This page requires admin permissions. Use Clerk's role system to verify.
//
// CLERK SETUP FOR ADMIN CHECK:
// import { useAuth, useUser } from '@clerk/clerk-react';
// const { user } = useUser();
// const isAdmin = user?.publicMetadata?.role === 'admin';
//
// if (!isAdmin) {
//   return <Navigate to="/" replace />;
// }
//
// DJANGO VIEWS NEEDED:
//
// 1. Admin Overview Stats

// URL PATTERNS:
// path('api/admin/overview/', AdminOverviewView.as_view(), name='admin-overview'),
// path('api/admin/sales-persons/', AdminCreateSalesPersonView.as_view(), name='admin-create-sales'),
// path('api/admin/sales-persons/<uuid:pk>/toggle-status/', ToggleSalesPersonStatusView.as_view(), name='toggle-status'),
// path('api/admin/leaderboard/', LeaderboardView.as_view(), name='admin-leaderboard'),
// path('api/referrals/', ReferralListView.as_view(), name='referral-list'),
// path('api/referrals/<uuid:pk>/approve/', ReferralApproveView.as_view(), name='referral-approve'),
// path('api/referrals/<uuid:pk>/reject/', ReferralRejectView.as_view(), name='referral-reject'),
// ============================================

export default function AdminReferrals() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [salesPeople, setSalesPeople] = useState<SalesPerson[]>([]);
  const [leaderboard, setLeaderboard] = useState<SalesPerson[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state for approval/rejection
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
    null
  );
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Modal for creating new sales account
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // ============================================
      // REAL API IMPLEMENTATION - Uncomment when backend is ready
      // ============================================
      // const authToken = await getToken(); // Get from your auth system
      // const headers = {
      //   'Authorization': `Bearer ${authToken}`,
      //   'Content-Type': 'application/json',
      // };
      //
      // const [overviewData, referralsData, salesData, leaderboardData] = await Promise.all([
      //   fetch(`${API_BASE_URL}/admin/overview/`, { headers }).then(r => r.json()),
      //   fetch(`${API_BASE_URL}/referrals/`, { headers }).then(r => r.json()),
      //   fetch(`${API_BASE_URL}/sales-persons/`, { headers }).then(r => r.json()),
      //   fetch(`${API_BASE_URL}/admin/leaderboard/`, { headers }).then(r => r.json()),
      // ]);
      // setOverview(overviewData);
      // setReferrals(referralsData.results || referralsData);
      // setSalesPeople(salesData.results || salesData);
      // setLeaderboard(leaderboardData);
      // ============================================

      // Mock data for now
      const mockOverview = await referralApi.getAdminOverview();
      const mockReferrals = await referralApi.getAllReferrals();
      const mockSales = await referralApi.getAllSalesPeople();
      const mockLeaderboard = await referralApi.getLeaderboard();

      setOverview(mockOverview);
      setReferrals(mockReferrals);
      setSalesPeople(mockSales);
      setLeaderboard(mockLeaderboard);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (referral: Referral) => {
    try {
      // ============================================
      // REAL API IMPLEMENTATION - Uncomment when backend is ready
      // ============================================
      // const authToken = await getToken();
      // const response = await fetch(`${API_BASE_URL}/referrals/${referral.id}/approve/`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${authToken}`,
      //     'Content-Type': 'application/json',
      //   },
      // });
      // if (!response.ok) throw new Error('Failed to approve');
      // await referralApi.approveReferral(referral.id);
      // ============================================

      toast.success(`Referral for ${referral.client_name} approved`);
      loadData(); // Reload data
    } catch (error) {
      console.error("Error approving referral:", error);
      toast.error("Failed to approve referral");
    }
  };

  const handleReject = async () => {
    if (!selectedReferral || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      // ============================================
      // REAL API IMPLEMENTATION - Uncomment when backend is ready
      // ============================================
      // const authToken = await getToken();
      // const response = await fetch(`${API_BASE_URL}/referrals/${selectedReferral.id}/reject/`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${authToken}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ reason: rejectionReason }),
      // });
      // if (!response.ok) throw new Error('Failed to reject');
      // await referralApi.rejectReferral(selectedReferral.id, rejectionReason);
      // ============================================

      toast.success(`Referral for ${selectedReferral.client_name} rejected`);
      setIsRejectModalOpen(false);
      setRejectionReason("");
      setSelectedReferral(null);
      loadData(); // Reload data
    } catch (error) {
      console.error("Error rejecting referral:", error);
      toast.error("Failed to reject referral");
    }
  };

  const openRejectModal = (referral: Referral) => {
    setSelectedReferral(referral);
    setIsRejectModalOpen(true);
  };

  const getStatusBadge = (status: Referral["status"]) => {
    const variants = {
      pending: { variant: "secondary" as const, icon: Clock, label: "Pending" },
      approved: {
        variant: "default" as const,
        icon: CheckCircle,
        label: "Approved",
      },
      confirmed: {
        variant: "default" as const,
        icon: CheckCircle,
        label: "Confirmed",
      },
      rejected: {
        variant: "destructive" as const,
        icon: Clock,
        label: "Rejected",
      },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "KES 0";
    return `KES ${amount.toLocaleString()}`;
  };

  // Chart data - would be computed from real data
  const chartData = salesPeople.slice(0, 5).map((sp) => ({
    name: sp.name.split(" ")[0],
    earnings: sp.total_earnings,
    referrals: sp.paid_referrals,
  }));

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Referral Management</h1>
          <p className="text-muted-foreground">
            Manage sales people and track referral performance
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Create Sales Account
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sales People
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.total_sales_people || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active sales team</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approval
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.pending_referrals || 0}
            </div>
            <p className="text-xs text-muted-foreground">Needs your review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overview?.total_revenue)}
            </div>
            <p className="text-xs text-muted-foreground">From referrals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Commissions Paid
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overview?.total_commissions)}
            </div>
            <p className="text-xs text-muted-foreground">To sales team</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performers - Earnings</CardTitle>
            <CardDescription>
              Total commission earned by top sales people
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="earnings" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referral Trends</CardTitle>
            <CardDescription>Number of confirmed referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="referrals"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Sales Leaderboard
          </CardTitle>
          <CardDescription>Top performing sales people</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Referral Code</TableHead>
                <TableHead>Total Referrals</TableHead>
                <TableHead>Paid Referrals</TableHead>
                <TableHead>Total Earnings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((person, index) => (
                <TableRow key={person.id}>
                  <TableCell>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{person.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{person.referral_code}</Badge>
                  </TableCell>
                  <TableCell>{person.total_referrals}</TableCell>
                  <TableCell>{person.paid_referrals}</TableCell>
                  <TableCell className="font-bold text-primary">
                    {formatCurrency(person.total_earnings)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Referrals Management */}
      <Card>
        <CardHeader>
          <CardTitle>All Referrals</CardTitle>
          <CardDescription>Review and manage referral requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">
                Pending ({overview?.pending_referrals || 0})
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Sales Person</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals
                    .filter((r) => r.status === "pending")
                    .map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell className="font-medium">
                          {referral.client_name}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {referral.sales_person_name}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {referral.sales_person_code}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{referral.client_email}</div>
                            <div className="text-muted-foreground">
                              {referral.client_phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(referral.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(referral.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(referral)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openRejectModal(referral)}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="all">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Sales Person</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell className="font-medium">
                        {referral.client_name}
                      </TableCell>
                      <TableCell>{referral.sales_person_name}</TableCell>
                      <TableCell>{getStatusBadge(referral.status)}</TableCell>
                      <TableCell>
                        {formatCurrency(referral.payment_amount)}
                      </TableCell>
                      <TableCell className="font-medium text-primary">
                        {formatCurrency(referral.commission_earned)}
                      </TableCell>
                      <TableCell>
                        {new Date(referral.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Referral</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this referral for{" "}
              {selectedReferral?.client_name}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Referral
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Sales Account Modal */}
      <CreateSalesAccountModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          loadData();
        }}
      />
    </div>
  );
}
