import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Gift,
  ArrowRight,
  Loader2,
  Sparkles,
  Building2,
  Users,
  PartyPopper,
  Shield,
  Star,
  Zap,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { referralApi } from "@/lib/referral-api";

/*
╔══════════════════════════════════════════════════════════════════════════════╗
║                      REFERRAL CONFIRMATION BACKEND                            ║
║                     Django Integration Guide                                  ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────────────┐
│ API ENDPOINT                                                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ POST /api/referrals/confirm/                                                 │
│                                                                              │
│ Headers:                                                                     │
│   Authorization: Bearer <clerk_jwt_token>                                    │
│   Content-Type: application/json                                             │
│                                                                              │
│ Request Body:                                                                │
│ {                                                                            │
│   "referral_code": "REF-ABC123" | "MYGIGS-DEFAULT"                           │
│ }                                                                            │
│                                                                              │
│ Response (Success):                                                          │
│ {                                                                            │
│   "success": true,                                                           │
│   "is_company_code": false,                                                  │
│   "sales_person": {                                                          │
│     "name": "John Doe",                                                      │
│     "id": 123                                                                │
│   },                                                                         │
│   "message": "Referral confirmed successfully"                               │
│ }                                                                            │
│                                                                              │
│ Response (Company Code):                                                     │
│ {                                                                            │
│   "success": true,                                                           │
│   "is_company_code": true,                                                   │
│   "sales_person": null,                                                      │
│   "message": "Welcome to MyGigs Africa!"                                     │
│ }                                                                            │
│                                                                              │
│ Response (Error):                                                            │
│ {                                                                            │
│   "error": "Invalid referral code",                                          │
│   "code": "INVALID_CODE"                                                     │
│ }                                                                            │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ DJANGO MODELS                                                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ # referrals/models.py                                                        │
│                                                                              │
│ from django.db import models                                                 │
│ from django.contrib.auth import get_user_model                               │
│                                                                              │
│ User = get_user_model()                                                      │
│                                                                              │
│ class SalesPerson(models.Model):                                             │
│     """Sales agent who can refer new freelancers"""                          │
│     user = models.OneToOneField(User, on_delete=models.CASCADE)              │
│     referral_code = models.CharField(max_length=20, unique=True, db_index=True)│
│     name = models.CharField(max_length=200)                                  │
│     phone = models.CharField(max_length=20)                                  │
│     email = models.EmailField()                                              │
│     is_active = models.BooleanField(default=True)                            │
│     total_referrals = models.PositiveIntegerField(default=0)                 │
│     paid_referrals = models.PositiveIntegerField(default=0)                  │
│     total_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0)│
│     pending_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0)│
│     created_at = models.DateTimeField(auto_now_add=True)                     │
│                                                                              │
│     def generate_code(self):                                                 │
│         import random, string                                                │
│         chars = string.ascii_uppercase + string.digits                       │
│         return f"REF-{''.join(random.choices(chars, k=6))}"                  │
│                                                                              │
│     def save(self, *args, **kwargs):                                         │
│         if not self.referral_code:                                           │
│             self.referral_code = self.generate_code()                        │
│         super().save(*args, **kwargs)                                        │
│                                                                              │
│                                                                              │
│ class Referral(models.Model):                                                │
│     """Record of a referral from sales person to freelancer"""               │
│     class Status(models.TextChoices):                                        │
│         PENDING = 'pending', 'Pending'                                       │
│         CONFIRMED = 'confirmed', 'Confirmed'                                 │
│         PAID = 'paid', 'Commission Paid'                                     │
│                                                                              │
│     sales_person = models.ForeignKey(                                        │
│         SalesPerson,                                                         │
│         on_delete=models.SET_NULL,                                           │
│         null=True,                                                           │
│         blank=True,                                                          │
│         related_name='referrals'                                             │
│     )                                                                        │
│     referred_user = models.OneToOneField(                                    │
│         User,                                                                │
│         on_delete=models.CASCADE,                                            │
│         related_name='referral'                                              │
│     )                                                                        │
│     status = models.CharField(                                               │
│         max_length=20,                                                       │
│         choices=Status.choices,                                              │
│         default=Status.CONFIRMED                                             │
│     )                                                                        │
│     is_organic = models.BooleanField(default=False)  # True if company code  │
│     commission_amount = models.DecimalField(                                 │
│         max_digits=10,                                                       │
│         decimal_places=2,                                                    │
│         default=50  # KSh 50 per referral                                    │
│     )                                                                        │
│     created_at = models.DateTimeField(auto_now_add=True)                     │
│     confirmed_at = models.DateTimeField(null=True, blank=True)               │
│     paid_at = models.DateTimeField(null=True, blank=True)                    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ DJANGO VIEW                                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ # referrals/views.py                                                         │
│                                                                              │
│ from rest_framework.views import APIView                                     │
│ from rest_framework.response import Response                                 │
│ from rest_framework.permissions import IsAuthenticated                       │
│ from django.utils import timezone                                            │
│ from django.db import transaction                                            │
│ from .models import SalesPerson, Referral                                    │
│                                                                              │
│ COMPANY_DEFAULT_CODE = 'MYGIGS-DEFAULT'                                      │
│ COMMISSION_AMOUNT = 50  # KSh 50 per successful referral                     │
│                                                                              │
│ class ConfirmReferralView(APIView):                                          │
│     """                                                                      │
│     Confirm a referral code after successful payment.                        │
│     Called after M-Pesa payment is completed.                                │
│     """                                                                      │
│     permission_classes = [IsAuthenticated]                                   │
│                                                                              │
│     def post(self, request):                                                 │
│         code = request.data.get('referral_code', '').strip().upper()         │
│         user = request.user                                                  │
│                                                                              │
│         # Check if user already has a referral                               │
│         if hasattr(user, 'referral'):                                        │
│             return Response({                                                │
│                 'error': 'Referral already confirmed',                       │
│                 'code': 'ALREADY_CONFIRMED'                                  │
│             }, status=400)                                                   │
│                                                                              │
│         if not code:                                                         │
│             return Response({                                                │
│                 'error': 'Referral code is required',                        │
│                 'code': 'CODE_REQUIRED'                                      │
│             }, status=400)                                                   │
│                                                                              │
│         with transaction.atomic():                                           │
│             # Handle company default code (organic signup)                   │
│             if code == COMPANY_DEFAULT_CODE:                                 │
│                 Referral.objects.create(                                     │
│                     sales_person=None,                                       │
│                     referred_user=user,                                      │
│                     status=Referral.Status.CONFIRMED,                        │
│                     is_organic=True,                                         │
│                     commission_amount=0,                                     │
│                     confirmed_at=timezone.now()                              │
│                 )                                                            │
│                 return Response({                                            │
│                     'success': True,                                         │
│                     'is_company_code': True,                                 │
│                     'sales_person': None,                                    │
│                     'message': 'Welcome to MyGigs Africa!'                   │
│                 })                                                           │
│                                                                              │
│             # Validate sales agent code                                      │
│             try:                                                             │
│                 sales_person = SalesPerson.objects.get(                      │
│                     referral_code=code,                                      │
│                     is_active=True                                           │
│                 )                                                            │
│             except SalesPerson.DoesNotExist:                                 │
│                 return Response({                                            │
│                     'error': 'Invalid or inactive referral code',            │
│                     'code': 'INVALID_CODE'                                   │
│                 }, status=400)                                               │
│                                                                              │
│             # Create referral record                                         │
│             referral = Referral.objects.create(                              │
│                 sales_person=sales_person,                                   │
│                 referred_user=user,                                          │
│                 status=Referral.Status.CONFIRMED,                            │
│                 is_organic=False,                                            │
│                 commission_amount=COMMISSION_AMOUNT,                         │
│                 confirmed_at=timezone.now()                                  │
│             )                                                                │
│                                                                              │
│             # Update sales person stats                                      │
│             sales_person.paid_referrals += 1                                 │
│             sales_person.pending_earnings += COMMISSION_AMOUNT               │
│             sales_person.save(update_fields=['paid_referrals', 'pending_earnings'])│
│                                                                              │
│         return Response({                                                    │
│             'success': True,                                                 │
│             'is_company_code': False,                                        │
│             'sales_person': {                                                │
│                 'name': sales_person.name,                                   │
│                 'id': sales_person.id                                        │
│             },                                                               │
│             'message': f'Thank you! {sales_person.name} referred you.'       │
│         })                                                                   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ DJANGO URLS                                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ # referrals/urls.py                                                          │
│                                                                              │
│ from django.urls import path                                                 │
│ from .views import ConfirmReferralView, VerifyCodeView                       │
│                                                                              │
│ urlpatterns = [                                                              │
│     path('confirm/', ConfirmReferralView.as_view(), name='confirm'),         │
│     path('verify/<str:code>/', VerifyCodeView.as_view(), name='verify'),     │
│ ]                                                                            │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
*/

const COMPANY_DEFAULT_CODE = "MYGIGS-DEFAULT";

const ReferralConfirmation = () => {
  const navigate = useNavigate();
  const [referralCode, setReferralCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [salesPersonName, setSalesPersonName] = useState("");
  const [isCompanyCode, setIsCompanyCode] = useState(false);

  const handleVerifyCode = async (code: string) => {
    if (!code.trim()) {
      toast({
        title: "Enter Code",
        description: "Please enter a referral code",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    const codeToVerify = code.toUpperCase().trim();

    try {
      // Check for company default code first
      if (codeToVerify === COMPANY_DEFAULT_CODE) {
        setIsVerified(true);
        setIsCompanyCode(true);
        setSalesPersonName("MyGigs Africa");
        toast({
          title: "Welcome to MyGigs Africa!",
          description: "You're all set to create your profile",
        });
        setIsVerifying(false);
        return;
      }

      // Verify sales agent code
      const result = await referralApi.verifyReferralCode(codeToVerify);

      if (result.valid && result.sales_person) {
        setIsVerified(true);
        setIsCompanyCode(false);
        setSalesPersonName(result.sales_person.name);
        toast({
          title: "Referral Applied!",
          description: `Thanks for being referred by ${result.sales_person.name}`,
        });
      } else {
        toast({
          title: "Invalid Code",
          description: "The referral code you entered is not valid",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      toast({
        title: "Verification Error",
        description: "Could not verify the code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUseCompanyCode = () => {
    setReferralCode(COMPANY_DEFAULT_CODE);
    handleVerifyCode(COMPANY_DEFAULT_CODE);
  };

  const handleContinue = () => {
    navigate("/freelancer/create-profile");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Celebration Header */}
        <div className="relative overflow-hidden border-b border-border/50">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-success/20 via-primary/10 to-accent/10" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyek0zNiAyNnYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

          {/* Floating decorations */}
          <motion.div
            className="absolute top-10 left-[10%] w-3 h-3 rounded-full bg-success/60"
            animate={{ y: [-10, 10, -10], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-20 right-[15%] w-2 h-2 rounded-full bg-primary/60"
            animate={{ y: [10, -10, 10], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          />
          <motion.div
            className="absolute bottom-10 left-[20%] w-4 h-4 rounded-full bg-accent/40"
            animate={{ y: [-5, 15, -5], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          />

          <div className="container mx-auto px-4 py-12 md:py-16 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-success to-success/60 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-success/30"
              >
                <PartyPopper className="h-12 w-12 text-success-foreground" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground"
              >
                Payment Successful! 🎉
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground text-lg md:text-xl max-w-lg mx-auto"
              >
                Just one more step before creating your professional profile
              </motion.p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-border/50 shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-accent/10 via-primary/5 to-transparent border-b border-border/50 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg shadow-accent/25">
                      <Gift className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-foreground">
                        Referral Code
                      </CardTitle>
                      <CardDescription className="text-base">
                        Enter a referral code if you have one
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  <AnimatePresence mode="wait">
                    {!isVerified ? (
                      <motion.div
                        key="input"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        {/* Referral Code Input */}
                        <div className="space-y-3">
                          <Label
                            htmlFor="referralCode"
                            className="text-foreground font-medium flex items-center gap-2"
                          >
                            <Star className="h-4 w-4 text-accent" />
                            Enter Referral Code
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="referralCode"
                              placeholder="e.g., REF-ABC123"
                              value={referralCode}
                              onChange={(e) =>
                                setReferralCode(e.target.value.toUpperCase())
                              }
                              className="h-14 text-center text-lg font-mono tracking-wider bg-background flex-1 rounded-xl border-2 focus:border-primary"
                              disabled={isVerifying}
                            />
                            <Button
                              onClick={() => handleVerifyCode(referralCode)}
                              disabled={isVerifying || !referralCode.trim()}
                              className="h-14 px-6 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                            >
                              {isVerifying ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <>
                                  Apply
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                              )}
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            If someone referred you to our platform, enter their
                            code to give them credit
                          </p>
                        </div>

                        {/* Divider */}
                        <div className="relative py-2">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border/50" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-4 text-muted-foreground font-medium">
                              Or continue directly
                            </span>
                          </div>
                        </div>

                        {/* Company Default Code Option */}
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.01, y: -2 }}
                          whileTap={{ scale: 0.99 }}
                          className="w-full p-5 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 text-left group"
                          onClick={handleUseCompanyCode}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                              <Building2 className="h-7 w-7 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg text-foreground">
                                  No Referral Code?
                                </h3>
                                <Badge variant="secondary" className="text-xs">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Quick
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Continue as a direct signup to MyGigs Africa
                              </p>
                            </div>
                            <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </div>
                        </motion.button>

                        {/* Info Card */}
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                          <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center shrink-0">
                            <Users className="h-5 w-5 text-secondary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground mb-1">
                              Sales Agent Referral
                            </p>
                            <p className="text-sm text-muted-foreground">
                              If one of our sales agents introduced you to the
                              platform, using their code helps reward them for
                              their effort.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        {/* Success Message */}
                        <motion.div
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className={`p-6 rounded-2xl border-2 flex items-center gap-5 ${
                            isCompanyCode
                              ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30"
                              : "bg-gradient-to-br from-success/10 to-success/5 border-success/30"
                          }`}
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              bounce: 0.5,
                              delay: 0.1,
                            }}
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                              isCompanyCode
                                ? "bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/30"
                                : "bg-gradient-to-br from-success to-success/60 shadow-lg shadow-success/30"
                            }`}
                          >
                            {isCompanyCode ? (
                              <Building2 className="h-8 w-8 text-primary-foreground" />
                            ) : (
                              <Sparkles className="h-8 w-8 text-success-foreground" />
                            )}
                          </motion.div>
                          <div>
                            <p className="font-bold text-xl text-foreground mb-1">
                              {isCompanyCode
                                ? "Welcome to MyGigs Africa!"
                                : "Referral Applied!"}
                            </p>
                            <p className="text-muted-foreground">
                              {isCompanyCode
                                ? "You're joining as a direct signup"
                                : `Thanks to ${salesPersonName} for referring you`}
                            </p>
                          </div>
                        </motion.div>

                        {/* Benefits Preview */}
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            {
                              icon: Shield,
                              label: "Verified Profile",
                              color: "success",
                            },
                            {
                              icon: Star,
                              label: "Get Reviews",
                              color: "accent",
                            },
                            {
                              icon: Zap,
                              label: "Priority Listing",
                              color: "primary",
                            },
                            {
                              icon: Users,
                              label: "Connect Clients",
                              color: "secondary",
                            },
                          ].map((item, i) => (
                            <motion.div
                              key={item.label}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 + i * 0.1 }}
                              className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50"
                            >
                              <item.icon
                                className={`h-5 w-5 text-${item.color}`}
                              />
                              <span className="text-sm font-medium text-foreground">
                                {item.label}
                              </span>
                            </motion.div>
                          ))}
                        </div>

                        <Button
                          className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl shadow-lg shadow-primary/25"
                          onClick={handleContinue}
                        >
                          Continue to Create Profile
                          <ArrowRight className="ml-2 h-6 w-6" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Skip Option - only show if not verified */}
            {!isVerified && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-6"
              >
                <Button
                  variant="link"
                  className="text-muted-foreground hover:text-foreground text-base"
                  onClick={handleUseCompanyCode}
                >
                  Skip and continue as direct signup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReferralConfirmation;
