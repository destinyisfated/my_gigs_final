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
  referralApi,
  type Referral,
  type SalesStats,
} from "@/lib/referral-api";
import {
  Copy,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Share2,
  QrCode,
  Smartphone,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// ============================================
// CLERK + DJANGO BACKEND INTEGRATION - SALES DASHBOARD
// ============================================
//
// AUTHENTICATION SETUP:
// This page requires authentication as a sales person.
// The sales person's ID and referral code come from Clerk metadata.
//
// CLERK HOOKS TO USE:
// import { useAuth, useUser } from '@clerk/clerk-react';
// import { useNavigate } from 'react-router-dom';
//
// const { isLoaded, isSignedIn, getToken } = useAuth();
// const { user } = useUser();
// const navigate = useNavigate();
//
// // Check if user is a sales person
// useEffect(() => {
//   if (isLoaded && !isSignedIn) {
//     navigate('/auth');
//     return;
//   }
//
//   if (isLoaded && user) {
//     const role = user.publicMetadata?.role;
//     if (role !== 'sales') {
//       toast.error('Access denied. Sales account required.');
//       navigate('/');
//       return;
//     }
//
//     // Get sales person data from Clerk metadata
//     setSalesPersonId(user.publicMetadata?.sales_person_id as string);
//     setReferralCode(user.publicMetadata?.referral_code as string);
//   }
// }, [isLoaded, isSignedIn, user]);
//
// ============================================
// DJANGO BACKEND VIEWS
// ============================================
//
// 1. Sales Dashboard View (Single API call for all dashboard data)
// class SalesPersonDashboardView(APIView):
//     permission_classes = [IsAuthenticated]
//
//     def get(self, request):
//         # Get sales person from Clerk user ID
//         clerk_user_id = request.clerk_user_id  # Set by middleware
//
//         try:
//             sales_person = SalesPerson.objects.get(clerk_user_id=clerk_user_id)
//         except SalesPerson.DoesNotExist:
//             return Response({'error': 'Not a registered sales person'}, status=403)
//
//         if not sales_person.is_active:
//             return Response({'error': 'Your account has been deactivated'}, status=403)
//
//         # Calculate stats
//         stats = {
//             'total_referrals': sales_person.total_referrals,
//             'pending_referrals': Referral.objects.filter(
//                 sales_person=sales_person, status='pending'
//             ).count(),
//             'confirmed_referrals': Referral.objects.filter(
//                 sales_person=sales_person, status='confirmed'
//             ).count(),
//             'total_earnings': float(sales_person.total_earnings),
//             'commission_rate': float(sales_person.commission_rate),
//         }
//
//         # Get recent referrals (last 50)
//         referrals = Referral.objects.filter(
//             sales_person=sales_person
//         ).order_by('-created_at')[:50]
//
//         return Response({
//             'sales_person': {
//                 'id': str(sales_person.id),
//                 'name': sales_person.name,
//                 'referral_code': sales_person.referral_code,
//                 'commission_rate': float(sales_person.commission_rate),
//             },
//             'stats': stats,
//             'referrals': ReferralSerializer(referrals, many=True).data,
//         })
//
// 2. URL Pattern
// path('api/sales/dashboard/', SalesPersonDashboardView.as_view(), name='sales-dashboard'),
//
// ============================================
// FRONTEND API CALL
// ============================================
//
// const fetchDashboardData = async () => {
//   const token = await getToken();
//
//   const response = await fetch(`${API_BASE_URL}/sales/dashboard/`, {
//     headers: {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json',
//     },
//   });
//
//   if (!response.ok) {
//     if (response.status === 403) {
//       const error = await response.json();
//       toast.error(error.error || 'Access denied');
//       navigate('/');
//       return;
//     }
//     throw new Error('Failed to fetch dashboard');
//   }
//
//   const data = await response.json();
//   setStats(data.stats);
//   setReferrals(data.referrals);
//   setReferralCode(data.sales_person.referral_code);
// };
//
// ============================================

export default function SalesDashboard() {
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  // ============================================
  // CLERK AUTHENTICATION - Replace mock with real auth
  // ============================================
  // import { useAuth, useUser } from '@clerk/clerk-react';
  // const { getToken } = useAuth();
  // const { user } = useUser();
  //
  // Get from Clerk user metadata:
  // const salesPersonId = user?.publicMetadata?.sales_person_id as string;
  // const referralCode = user?.publicMetadata?.referral_code as string;
  // ============================================

  // Mock values - replace with Clerk data
  const salesPersonId = "1";
  const referralCode = "AB1234CD";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // ============================================
      // REAL API IMPLEMENTATION - Uncomment when backend is ready
      // ============================================
      // const token = await getToken();
      // const response = await fetch(`${API_BASE_URL}/sales/dashboard/`, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      // });
      //
      // if (!response.ok) {
      //   if (response.status === 403) {
      //     toast.error('Access denied');
      //     navigate('/');
      //     return;
      //   }
      //   throw new Error('Failed to load dashboard');
      // }
      //
      // const data = await response.json();
      // setStats(data.stats);
      // setReferrals(data.referrals);
      // ============================================

      // Mock data for now
      const mockStats = await referralApi.getSalesPersonStats(salesPersonId);
      const mockReferrals = await referralApi.getAllReferrals();
      setStats(mockStats);
      setReferrals(mockReferrals);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied to clipboard!");
  };

  const shareReferralLink = () => {
    const shareUrl = `${window.location.origin}/freelancer/signup?ref=${referralCode}`;
    if (navigator.share) {
      navigator.share({
        title: "Join MyGigs",
        text: `Use my referral code ${referralCode} to sign up!`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Referral link copied to clipboard!");
    }
  };

  const getStatusBadge = (status: Referral["status"]) => {
    const variants = {
      pending: {
        variant: "secondary" as const,
        icon: Clock,
        label: "Pending",
        color: "text-amber-500",
      },
      approved: {
        variant: "default" as const,
        icon: CheckCircle,
        label: "Approved",
        color: "text-blue-500",
      },
      confirmed: {
        variant: "default" as const,
        icon: CheckCircle,
        label: "Confirmed",
        color: "text-green-500",
      },
      rejected: {
        variant: "destructive" as const,
        icon: XCircle,
        label: "Rejected",
        color: "text-red-500",
      },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "KES 0";
    return `KES ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Sales Dashboard</h1>
        <p className="text-muted-foreground">
          Track your referrals and earnings
        </p>
      </motion.div>

      {/* Referral Code Card - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">
                  Your Referral Code
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold tracking-[0.2em] text-primary font-mono">
                    {referralCode}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyReferralCode}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this code with potential freelancers to earn commission
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareReferralLink}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share Link
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <QrCode className="h-4 w-4" />
                  QR Code
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Smartphone className="h-4 w-4" />
                  SMS Invite
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Referrals
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.total_referrals || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All time referrals
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.pending_referrals || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting admin approval
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.confirmed_referrals || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Paid referrals</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(stats?.total_earnings)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Commission earned
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Referrals Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Referrals</CardTitle>
                <CardDescription>
                  Track the status of all your referred clients
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpRight className="h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client Name</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Email
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Phone
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Payment</TableHead>
                        <TableHead className="text-right">Commission</TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Date
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referrals.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-10 text-muted-foreground"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Users className="h-10 w-10 text-muted-foreground/50" />
                              <p>No referrals yet. Start sharing your code!</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        referrals.map((referral) => (
                          <TableRow key={referral.id}>
                            <TableCell className="font-medium">
                              {referral.client_name}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-muted-foreground">
                              {referral.client_email}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground">
                              {referral.client_phone || "-"}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(referral.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(referral.payment_amount)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-primary">
                              {formatCurrency(referral.commission_earned)}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground">
                              {new Date(
                                referral.created_at
                              ).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Filtered tabs */}
              {["pending", "approved", "confirmed"].map((statusFilter) => (
                <TabsContent key={statusFilter} value={statusFilter}>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client Name</TableHead>
                          <TableHead className="hidden sm:table-cell">
                            Email
                          </TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Payment</TableHead>
                          <TableHead className="text-right">
                            Commission
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Date
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {referrals.filter((r) => r.status === statusFilter)
                          .length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="text-center py-10 text-muted-foreground"
                            >
                              No {statusFilter} referrals
                            </TableCell>
                          </TableRow>
                        ) : (
                          referrals
                            .filter((r) => r.status === statusFilter)
                            .map((referral) => (
                              <TableRow key={referral.id}>
                                <TableCell className="font-medium">
                                  {referral.client_name}
                                </TableCell>
                                <TableCell className="hidden sm:table-cell text-muted-foreground">
                                  {referral.client_email}
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(referral.status)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(referral.payment_amount)}
                                </TableCell>
                                <TableCell className="text-right font-medium text-primary">
                                  {formatCurrency(referral.commission_earned)}
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-muted-foreground">
                                  {new Date(
                                    referral.created_at
                                  ).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
