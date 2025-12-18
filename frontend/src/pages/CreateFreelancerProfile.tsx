import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Briefcase,
  MapPin,
  X,
  Plus,
  CheckCircle,
  ArrowRight,
  FileText,
  Sparkles,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { LocationSelect } from "@/components/LocationSelect";
import {
  DocumentUpload,
  type UploadedDocument,
} from "@/components/DocumentUpload";

// ============= Django Backend Integration =============
//
// This page is shown after successful M-Pesa payment
// The user's role should already be converted to 'freelancer' by the payment callback
//
// GET /api/users/me/ - Verify user is authenticated and has freelancer role
// Headers: { Authorization: `Bearer ${clerkToken}` }
// Response: { id, clerk_id, email, role, created_at }
//
// POST /api/freelancers/profile/create/
// Headers: { Authorization: `Bearer ${clerkToken}` }
// Request body:
// {
//   "first_name": "John",
//   "last_name": "Doe",
//   "professional_title": "Web Developer",
//   "tagline": "Building amazing websites",
//   "bio": "Experienced developer...",
//   "email": "john@example.com",
//   "phone": "+254712345678",
//   "county_id": "047",
//   "constituency_id": "123",
//   "ward_id": "456",
//   "category": "web-dev",
//   "hourly_rate": 35,
//   "experience_years": "3-5",
//   "availability": "full-time",
//   "skills": ["React", "Node.js", "TypeScript"]
// }
//
// Response on success:
// {
//   "id": 1,
//   "slug": "john-doe-web-developer",
//   "profile_url": "/freelancer/john-doe-web-developer",
//   "message": "Profile created successfully"
// }
//
// Django Model:
// class FreelancerProfile(models.Model):
//     user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='freelancer_profile')
//     first_name = models.CharField(max_length=100)
//     last_name = models.CharField(max_length=100)
//     professional_title = models.CharField(max_length=200)
//     tagline = models.CharField(max_length=300, blank=True)
//     bio = models.TextField()
//     email = models.EmailField()
//     phone = models.CharField(max_length=20)
//     county = models.ForeignKey('locations.County', on_delete=models.SET_NULL, null=True)
//     constituency = models.ForeignKey('locations.Constituency', on_delete=models.SET_NULL, null=True)
//     ward = models.ForeignKey('locations.Ward', on_delete=models.SET_NULL, null=True)
//     category = models.CharField(max_length=100)
//     hourly_rate = models.DecimalField(max_digits=10, decimal_places=2)
//     experience_years = models.CharField(max_length=20)
//     availability = models.CharField(max_length=50)
//     skills = models.JSONField(default=list)
//     slug = models.SlugField(unique=True)
//     is_active = models.BooleanField(default=True)
//     created_at = models.DateTimeField(auto_now_add=True)
//     updated_at = models.DateTimeField(auto_now=True)
//
// Django View:
// class CreateFreelancerProfileView(APIView):
//     permission_classes = [IsAuthenticated, IsFreelancer]
//
//     def post(self, request):
//         # Check if profile already exists
//         if hasattr(request.user, 'freelancer_profile'):
//             return Response({'error': 'Profile already exists'}, status=400)
//
//         serializer = FreelancerProfileCreateSerializer(data=request.data)
//         if serializer.is_valid():
//             profile = serializer.save(user=request.user)
//             return Response({
//                 'id': profile.id,
//                 'slug': profile.slug,
//                 'profile_url': f'/freelancer/{profile.slug}',
//                 'message': 'Profile created successfully'
//             }, status=201)
//         return Response(serializer.errors, status=400)
// =======================================================

const CreateFreelancerProfile = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedConstituency, setSelectedConstituency] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    professionalTitle: "",
    tagline: "",
    bio: "",
    email: "",
    phone: "",
    category: "",
    hourlyRate: "",
    experienceYears: "",
    availability: "",
  });

  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // ============= Clerk + Django Integration =============
    //
    // import { useUser, useAuth } from '@clerk/clerk-react';
    // const { user } = useUser();
    // const { getToken } = useAuth();
    //
    // const submitProfile = async () => {
    //   try {
    //     const token = await getToken();
    //
    //     const response = await fetch(`${import.meta.env.VITE_API_URL}/api/freelancers/profile/create/`, {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${token}`,
    //       },
    //       body: JSON.stringify({
    //         first_name: formData.firstName,
    //         last_name: formData.lastName,
    //         professional_title: formData.professionalTitle,
    //         tagline: formData.tagline,
    //         bio: formData.bio,
    //         email: formData.email,
    //         phone: formData.phone,
    //         county_id: selectedCounty,
    //         constituency_id: selectedConstituency,
    //         ward_id: selectedWard,
    //         category: formData.category,
    //         hourly_rate: parseFloat(formData.hourlyRate),
    //         experience_years: formData.experienceYears,
    //         availability: formData.availability,
    //         skills: skills,
    //       }),
    //     });
    //
    //     if (!response.ok) {
    //       const error = await response.json();
    //       throw new Error(error.message || 'Failed to create profile');
    //     }
    //
    //     const data = await response.json();
    //
    //     toast({
    //       title: "Profile Created!",
    //       description: "Your freelancer profile is now live",
    //     });
    //
    //     // Redirect to freelancer dashboard
    //     navigate('/dashboard/freelancer');
    //   } catch (error) {
    //     toast({
    //       title: "Error",
    //       description: error.message,
    //       variant: "destructive",
    //     });
    //   }
    // };
    // =======================================================

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Profile Created!",
        description:
          "Your freelancer profile is now live. Redirecting to dashboard...",
      });

      setTimeout(() => {
        navigate("/dashboard/freelancer");
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Payment Successful! 🎉
              </h1>
              <p className="text-muted-foreground text-lg">
                Complete your freelancer profile to start getting discovered by
                clients
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Tell us about yourself</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="professionalTitle">
                      Professional Title *
                    </Label>
                    <Input
                      id="professionalTitle"
                      placeholder="e.g., Full Stack Web Developer"
                      value={formData.professionalTitle}
                      onChange={(e) =>
                        handleInputChange("professionalTitle", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      placeholder="A brief catchy description of what you do"
                      value={formData.tagline}
                      onChange={(e) =>
                        handleInputChange("tagline", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio *</Label>
                    <Textarea
                      id="bio"
                      rows={4}
                      placeholder="Tell clients about yourself, your experience, and what you can offer..."
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+254 712 345 678"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Location
                  </CardTitle>
                  <CardDescription>Where are you based?</CardDescription>
                </CardHeader>
                <CardContent>
                  <LocationSelect
                    selectedCounty={selectedCounty}
                    selectedConstituency={selectedConstituency}
                    selectedWard={selectedWard}
                    onCountyChange={(id) => setSelectedCounty(id)}
                    onConstituencyChange={(id) => setSelectedConstituency(id)}
                    onWardChange={(id) => setSelectedWard(id)}
                    required
                  />
                </CardContent>
              </Card>

              {/* Professional Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Professional Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          handleInputChange("category", value)
                        }
                        required
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          <SelectItem value="web-dev">
                            Web Development
                          </SelectItem>
                          <SelectItem value="mobile-dev">
                            Mobile Development
                          </SelectItem>
                          <SelectItem value="design">Graphic Design</SelectItem>
                          <SelectItem value="writing">
                            Content Writing
                          </SelectItem>
                          <SelectItem value="carpenter">Carpentry</SelectItem>
                          <SelectItem value="plumber">Plumbing</SelectItem>
                          <SelectItem value="electrician">
                            Electrical
                          </SelectItem>
                          <SelectItem value="teacher">Teaching</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Hourly Rate (KSh) *</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        placeholder="500"
                        value={formData.hourlyRate}
                        onChange={(e) =>
                          handleInputChange("hourlyRate", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience *</Label>
                      <Select
                        value={formData.experienceYears}
                        onValueChange={(value) =>
                          handleInputChange("experienceYears", value)
                        }
                        required
                      >
                        <SelectTrigger id="experience">
                          <SelectValue placeholder="Select experience" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          <SelectItem value="0-1">Less than 1 year</SelectItem>
                          <SelectItem value="1-3">1-3 years</SelectItem>
                          <SelectItem value="3-5">3-5 years</SelectItem>
                          <SelectItem value="5-10">5-10 years</SelectItem>
                          <SelectItem value="10+">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="availability">Availability *</Label>
                      <Select
                        value={formData.availability}
                        onValueChange={(value) =>
                          handleInputChange("availability", value)
                        }
                        required
                      >
                        <SelectTrigger id="availability">
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="weekends">
                            Weekends only
                          </SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills</Label>
                    <div className="flex gap-2">
                      <Input
                        id="skills"
                        placeholder="Type a skill and press Enter"
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={addSkill}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="px-3 py-1"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="ml-2 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Documents Upload */}
              <Card className="border-border/50 shadow-card overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-accent/10 via-primary/5 to-transparent border-b border-border/50">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Documents & Certificates
                  </CardTitle>
                  <CardDescription>
                    Upload certificates, portfolio samples, and ID documents to
                    build trust with clients
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <DocumentUpload
                    documents={documents}
                    onDocumentsChange={setDocuments}
                    maxFiles={10}
                    maxSizeMB={5}
                  />
                </CardContent>
              </Card>

              {/* Submit Button */}
              <motion.div
                className="flex justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="min-w-[220px] h-14 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      Create Profile
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateFreelancerProfile;
