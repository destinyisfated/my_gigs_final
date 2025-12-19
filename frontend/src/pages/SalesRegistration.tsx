import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  Copy,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Gift,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

// ============================================
// CLERK AUTHENTICATION INTEGRATION
// ============================================
//
// Step 1: Install Clerk packages
// npm install @clerk/clerk-react
//
// Step 2: Add Clerk provider to main.tsx or App.tsx
// import { ClerkProvider } from '@clerk/clerk-react';
// const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
//
// <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
//   <App />
// </ClerkProvider>
//
// Step 3: Use Clerk hooks in this component
// import { useSignUp, useUser, useAuth } from '@clerk/clerk-react';
//
// const { isLoaded, signUp, setActive } = useSignUp();
// const { user } = useUser();
// const { getToken } = useAuth();
//
// Step 4: Implement sign up with Clerk
// const handleClerkSignUp = async () => {
//   if (!isLoaded) return;
//
//   try {
//     // Create user in Clerk
//     const result = await signUp.create({
//       emailAddress: formData.email,
//       password: formData.password,
//       firstName: formData.firstName,
//       lastName: formData.lastName,
//       unsafeMetadata: {
//         role: 'sales',
//         phone: formData.phone,
//       }
//     });
//
//     // If email verification is required
//     if (result.status === 'missing_requirements') {
//       await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
//       setShowVerification(true);
//       return;
//     }
//
//     // Set the session active
//     if (result.status === 'complete') {
//       await setActive({ session: result.createdSessionId });
//
//       // Now create sales person in your Django backend
//       const token = await getToken();
//       await createSalesPersonInBackend(token, formData);
//     }
//   } catch (error: any) {
//     console.error('Clerk sign up error:', error);
//     toast.error(error.errors?.[0]?.message || 'Failed to sign up');
//   }
// };
//
// ============================================

// ============================================
// DJANGO BACKEND INTEGRATION
// ============================================
//
// After Clerk creates the user, create a SalesPerson record in Django:
//
// const createSalesPersonInBackend = async (clerkToken: string, data: FormData) => {
//   const response = await fetch(`${API_BASE_URL}/sales-persons/register/`, {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${clerkToken}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       name: `${data.firstName} ${data.lastName}`,
//       email: data.email,
//       phone: data.phone,
//     }),
//   });
//
//   if (!response.ok) throw new Error('Failed to create sales profile');
//
//   const salesPerson = await response.json();
//   return salesPerson; // Contains the generated referral_code
// };
//
// DJANGO VIEW:
//
// class SalesPersonRegistrationView(APIView):
//     permission_classes = [IsAuthenticated]
//
//     def post(self, request):
//         # Get the Clerk user ID from the JWT token
//         clerk_user_id = request.user.id  # Your auth middleware should set this
//
//         # Check if already registered
//         if SalesPerson.objects.filter(user_id=clerk_user_id).exists():
//             return Response({'error': 'Already registered as sales person'}, status=400)
//
//         # Generate unique referral code
//         import random, string
//         while True:
//             code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
//             if not SalesPerson.objects.filter(referral_code=code).exists():
//                 break
//
//         # Create sales person
//         sales_person = SalesPerson.objects.create(
//             user_id=clerk_user_id,
//             name=request.data.get('name'),
//             email=request.data.get('email'),
//             phone=request.data.get('phone'),
//             referral_code=code,
//             commission_rate=10.00,  # Default 10%
//         )
//
//         return Response(SalesPersonSerializer(sales_person).data, status=201)
//
// URL:
// path('api/sales-persons/register/', SalesPersonRegistrationView.as_view(), name='sales-register'),
// ============================================

// Form validation schema
const registrationSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name too long"),
    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name too long"),
    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .max(255, "Email too long"),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password too long"),
    confirmPassword: z.string(),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, "You must accept the terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof registrationSchema>;

export default function SalesRegistration() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const generateReferralCode = (
    firstName: string,
    lastName: string
  ): string => {
    const prefix = (
      lastName.substring(0, 4) + firstName.charAt(0)
    ).toUpperCase();
    const suffix = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `${prefix}${suffix}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const result = registrationSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof FormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // ============================================
      // CLERK + DJANGO IMPLEMENTATION - Uncomment when ready
      // ============================================
      //
      // Step 1: Create user in Clerk
      // const clerkResult = await signUp.create({
      //   emailAddress: formData.email,
      //   password: formData.password,
      //   firstName: formData.firstName,
      //   lastName: formData.lastName,
      //   unsafeMetadata: {
      //     role: 'sales',
      //     phone: formData.phone,
      //   }
      // });
      //
      // Step 2: Handle email verification if required
      // if (clerkResult.status === 'missing_requirements') {
      //   await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      //   // Show verification UI...
      //   return;
      // }
      //
      // Step 3: Set session active and create backend record
      // if (clerkResult.status === 'complete') {
      //   await setActive({ session: clerkResult.createdSessionId });
      //
      //   const token = await getToken();
      //   const response = await fetch(`${API_BASE_URL}/sales-persons/register/`, {
      //     method: 'POST',
      //     headers: {
      //       'Authorization': `Bearer ${token}`,
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({
      //       name: `${formData.firstName} ${formData.lastName}`,
      //       email: formData.email,
      //       phone: formData.phone,
      //     }),
      //   });
      //
      //   if (!response.ok) {
      //     const error = await response.json();
      //     throw new Error(error.message || 'Failed to create sales profile');
      //   }
      //
      //   const salesPerson = await response.json();
      //   setGeneratedCode(salesPerson.referral_code);
      //   setRegistrationComplete(true);
      // }
      // ============================================

      // Mock implementation - simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate mock referral code
      const code = generateReferralCode(formData.firstName, formData.lastName);
      setGeneratedCode(code);
      setRegistrationComplete(true);

      toast.success("Registration successful! Welcome to the sales team!");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success("Referral code copied to clipboard!");
  };

  // Success state - show referral code
  if (registrationComplete) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <Navbar />

        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-lg text-center border-0 shadow-2xl bg-white dark:bg-gray-900">
            <CardHeader className="pb-4">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Welcome to the Team!</CardTitle>
              <CardDescription className="text-base">
                Your sales account has been created successfully
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-2">
                  Your Unique Referral Code
                </p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-bold tracking-widest text-primary">
                    {generatedCode}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyReferralCode}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-left space-y-3">
                <h4 className="font-semibold text-lg">What's Next?</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    Share your referral code with potential freelancers
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    When they sign up using your code, you'll be credited
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    Earn commission after their payment is confirmed
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    Track your earnings in your sales dashboard
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => navigate("/dashboard/sales")}
                >
                  Go to Your Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => navigate("/")}>
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  // Registration form
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: Benefits */}
            <div className="space-y-8">
              <div>
                <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                  Join Our Sales Team
                </Badge>
                <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                  Earn Money by Referring Freelancers
                </h1>
                <p className="text-md text-muted-foreground">
                  Become a sales agent and earn commission for every freelancer
                  you bring to the platform. Start earning today with your
                  unique referral code.
                </p>
              </div>

              {/* Benefits Cards */}
              <div className="grid gap-4">
                <Card className="border-0 shadow-md bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="p-3 rounded-xl bg-orange-500/10">
                      <DollarSign className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        10% Commission
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Earn 10% for the 1st payment made by freelancers you
                        refer.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="p-3 rounded-xl bg-blue-500/10">
                      <Gift className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        Unique Referral Code
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Get your personal referral code to share with potential
                        freelancers.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="p-3 rounded-xl bg-green-500/10">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        Track Your Earnings
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Monitor your referrals and commissions in real-time from
                        your dashboard.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right: Registration Form */}
            <Card className="border-0 shadow-2xl bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Create Your Sales Account
                </CardTitle>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={errors.firstName ? "border-destructive" : ""}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-destructive">
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Kamau"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={errors.lastName ? "border-destructive" : ""}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-destructive">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+254712345678"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={errors.password ? "border-destructive" : ""}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={
                        errors.confirmPassword ? "border-destructive" : ""
                      }
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          acceptTerms: checked as boolean,
                        }))
                      }
                      className={errors.acceptTerms ? "border-destructive" : ""}
                    />
                    <label
                      htmlFor="acceptTerms"
                      className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                    >
                      I agree to the{" "}
                      <a href="#" className="text-primary hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-primary hover:underline">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="text-sm text-destructive">
                      {errors.acceptTerms}
                    </p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Sales Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
