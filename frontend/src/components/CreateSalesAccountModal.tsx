import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  UserPlus,
  Copy,
  Check,
  Sparkles,
  Mail,
  Phone,
  User,
  Percent,
  Lock,
  Eye,
  EyeOff,
  Shield,
  BadgeCheck,
} from "lucide-react";

/**
 * ============================================================
 * DJANGO + CLERK BACKEND INTEGRATION GUIDE
 * ============================================================
 *
 * 1. DJANGO MODELS (models.py)
 * ----------------------------
 * from django.db import models
 * from django.contrib.auth.models import User
 *
 * class SalesPerson(models.Model):
 *     clerk_user_id = models.CharField(max_length=255, unique=True)
 *     email = models.EmailField(unique=True)
 *     first_name = models.CharField(max_length=100)
 *     last_name = models.CharField(max_length=100)
 *     phone = models.CharField(max_length=20)
 *     referral_code = models.CharField(max_length=20, unique=True)
 *     commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
 *     total_referrals = models.PositiveIntegerField(default=0)
 *     successful_conversions = models.PositiveIntegerField(default=0)
 *     total_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0)
 *     pending_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0)
 *     is_active = models.BooleanField(default=True)
 *     must_change_password = models.BooleanField(default=True)
 *     created_at = models.DateTimeField(auto_now_add=True)
 *     updated_at = models.DateTimeField(auto_now=True)
 *
 *     class Meta:
 *         ordering = ['-created_at']
 *
 *     @classmethod
 *     def generate_referral_code(cls, first_name, last_name):
 *         """Generate code like JD001 from John Doe"""
 *         initials = (first_name[0] + last_name[0]).upper()
 *         # Get the latest code with same initials
 *         latest = cls.objects.filter(
 *             referral_code__startswith=initials
 *         ).order_by('-referral_code').first()
 *
 *         if latest:
 *             # Extract number and increment
 *             current_num = int(latest.referral_code[2:])
 *             new_num = current_num + 1
 *         else:
 *             new_num = 1
 *
 *         return f"{initials}{new_num:03d}"
 *
 *
 * 2. SERIALIZERS (serializers.py)
 * --------------------------------
 * from rest_framework import serializers
 * from .models import SalesPerson
 *
 * class CreateSalesPersonSerializer(serializers.Serializer):
 *     first_name = serializers.CharField(max_length=100)
 *     last_name = serializers.CharField(max_length=100)
 *     email = serializers.EmailField()
 *     phone = serializers.CharField(max_length=20)
 *     password = serializers.CharField(min_length=8, write_only=True)
 *     commission_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
 *
 * class SalesPersonSerializer(serializers.ModelSerializer):
 *     class Meta:
 *         model = SalesPerson
 *         fields = '__all__'
 *         read_only_fields = ['clerk_user_id', 'referral_code', 'created_at']
 *
 *
 * 3. ADMIN VIEW (views.py)
 * -------------------------
 * from rest_framework.views import APIView
 * from rest_framework.response import Response
 * from rest_framework import status
 * from clerk_backend_api import Clerk
 * from django.conf import settings
 * from .models import SalesPerson
 * from .serializers import CreateSalesPersonSerializer
 *
 * clerk = Clerk(bearer_auth=settings.CLERK_SECRET_KEY)
 *
 * class AdminCreateSalesPersonView(APIView):
 *     """Admin-only endpoint to create sales accounts"""
 *
 *     def post(self, request):
 *         # Verify admin role from Clerk
 *         if not self.is_admin(request):
 *             return Response({'error': 'Unauthorized'}, status=403)
 *
 *         serializer = CreateSalesPersonSerializer(data=request.data)
 *         if not serializer.is_valid():
 *             return Response(serializer.errors, status=400)
 *
 *         data = serializer.validated_data
 *
 *         # Generate referral code using initials + sequential number
 *         referral_code = SalesPerson.generate_referral_code(
 *             data['first_name'],
 *             data['last_name']
 *         )
 *
 *         try:
 *             # Create user in Clerk with password
 *             clerk_user = clerk.users.create(
 *                 email_address=[data['email']],
 *                 password=data['password'],
 *                 first_name=data['first_name'],
 *                 last_name=data['last_name'],
 *                 public_metadata={
 *                     'role': 'sales_agent',
 *                     'referral_code': referral_code
 *                 }
 *             )
 *
 *             # Create SalesPerson record
 *             sales_person = SalesPerson.objects.create(
 *                 clerk_user_id=clerk_user.id,
 *                 email=data['email'],
 *                 first_name=data['first_name'],
 *                 last_name=data['last_name'],
 *                 phone=data['phone'],
 *                 referral_code=referral_code,
 *                 commission_rate=data['commission_rate'],
 *                 must_change_password=True
 *             )
 *
 *             # Send welcome email with credentials
 *             self.send_welcome_email(sales_person, data['password'])
 *
 *             return Response({
 *                 'success': True,
 *                 'sales_person': SalesPersonSerializer(sales_person).data,
 *                 'referral_code': referral_code
 *             }, status=201)
 *
 *         except Exception as e:
 *             return Response({'error': str(e)}, status=500)
 *
 *
 * 4. URL PATTERNS (urls.py)
 * --------------------------
 * from django.urls import path
 * from .views import AdminCreateSalesPersonView
 *
 * urlpatterns = [
 *     path('api/admin/sales-persons/', AdminCreateSalesPersonView.as_view()),
 * ]
 *
 * ============================================================
 */

interface CreateSalesAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  existingCodesCount?: number;
}

interface SalesAccountData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  commissionRate: number;
}

export function CreateSalesAccountModal({
  isOpen,
  onClose,
  onSuccess,
  existingCodesCount = 0,
}: CreateSalesAccountModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<"code" | "password" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState<SalesAccountData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    commissionRate: 10,
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generateReferralCode = (
    firstName: string,
    lastName: string
  ): string => {
    if (!firstName || !lastName) return "";
    const initials = (firstName[0] + lastName[0]).toUpperCase();
    const nextNumber = existingCodesCount + 1;
    return `${initials}${nextNumber.toString().padStart(3, "0")}`;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (formData.commissionRate < 1 || formData.commissionRate > 50) {
      newErrors.commissionRate = "Commission must be between 1-50%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    const code = generateReferralCode(formData.firstName, formData.lastName);
    setGeneratedCode(code);

    /**
     * BACKEND INTEGRATION:
     * --------------------
     * const token = await clerk.session?.getToken();
     * const response = await fetch('/api/admin/sales-persons/', {
     *   method: 'POST',
     *   headers: {
     *     'Authorization': `Bearer ${token}`,
     *     'Content-Type': 'application/json'
     *   },
     *   body: JSON.stringify({
     *     first_name: formData.firstName,
     *     last_name: formData.lastName,
     *     email: formData.email,
     *     phone: formData.phone,
     *     password: formData.password,
     *     commission_rate: formData.commissionRate
     *   })
     * });
     * const data = await response.json();
     * if (data.success) {
     *   setGeneratedCode(data.referral_code);
     *   setStep("success");
     * }
     */

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setStep("success");

    toast.success("Sales Account Created", {
      description: `Account for ${formData.firstName} ${formData.lastName} created successfully.`,
    });
  };

  const copyToClipboard = async (text: string, type: "code" | "password") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied!", {
      description: `${
        type === "code" ? "Referral code" : "Password"
      } copied to clipboard.`,
    });
  };

  const handleClose = () => {
    setStep("form");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      commissionRate: 10,
    });
    setConfirmPassword("");
    setErrors({});
    setGeneratedCode("");
    onClose();
    if (step === "success") {
      onSuccess?.();
    }
  };

  const previewCode = generateReferralCode(
    formData.firstName,
    formData.lastName
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border/50 overflow-hidden">
        <AnimatePresence mode="wait">
          {step === "form" ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  Create Sales Account
                </DialogTitle>
              </DialogHeader>

              {previewCode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        Generated Code:
                      </span>
                    </div>
                    <span className="font-mono text-lg font-bold text-primary">
                      {previewCode}
                    </span>
                  </div>
                </motion.div>
              )}

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="flex items-center gap-2 text-sm"
                    >
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      className={errors.firstName ? "border-destructive" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-destructive">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="flex items-center gap-2 text-sm"
                    >
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      className={errors.lastName ? "border-destructive" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-destructive">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm"
                  >
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="flex items-center gap-2 text-sm"
                  >
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+254 7XX XXX XXX"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="flex items-center gap-2 text-sm"
                  >
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 8 characters"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className={`pr-10 ${
                        errors.password ? "border-destructive" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="flex items-center gap-2 text-sm"
                  >
                    <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pr-10 ${
                        errors.confirmPassword ? "border-destructive" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="commission"
                    className="flex items-center gap-2 text-sm"
                  >
                    <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                    Commission Rate (%)
                  </Label>
                  <Input
                    id="commission"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.commissionRate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        commissionRate: Number(e.target.value),
                      }))
                    }
                    className={
                      errors.commissionRate ? "border-destructive" : ""
                    }
                  />
                  {errors.commissionRate && (
                    <p className="text-xs text-destructive">
                      {errors.commissionRate}
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full h-12 text-base"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Sales Account
                  </>
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6 py-4"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30"
                >
                  <Check className="h-8 w-8 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-semibold">Account Created!</h3>
                  <p className="text-muted-foreground">
                    Sales account for {formData.firstName} {formData.lastName}{" "}
                    is ready
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Referral Code
                      </p>
                      <p className="text-2xl font-mono font-bold text-primary">
                        {generatedCode}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyToClipboard(generatedCode, "code")}
                      className="shrink-0"
                    >
                      {copied === "code" ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Password</p>
                      <p className="text-lg font-mono">{formData.password}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(formData.password, "password")
                      }
                      className="shrink-0"
                    >
                      {copied === "password" ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span>{formData.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Commission</span>
                    <span>{formData.commissionRate}%</span>
                  </div>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Share these credentials securely. The user will be prompted to
                  change their password on first login.
                </p>
              </div>

              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

export default CreateSalesAccountModal;
