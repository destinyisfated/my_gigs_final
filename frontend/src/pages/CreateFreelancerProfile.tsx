import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
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
  ArrowRight,
  FileText,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { LocationSelect } from "@/components/LocationSelect";
import { FreelancerDocumentsModal } from "@/components/FreelancerDocumentsModal";

type Profession = {
  id: number;
  name: string;
};

const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "busy", label: "Busy" },
  { value: "unavailable", label: "Unavailable" },
];

const CreateFreelancerProfile = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);

  /* professions */
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [loadingProfessions, setLoadingProfessions] = useState(true);

  /* skills */
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");

  /* location */
  const [county, setCounty] = useState("");
  const [constituency, setConstituency] = useState("");
  const [ward, setWard] = useState("");

  /* form */
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    email: "",
    phone: "",
    profession: "",
    hourlyRate: "",
    yearsExperience: "",
    availability: "available",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /* load professions */
  useEffect(() => {
    const loadProfessions = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/professions/`
        );
        const data = await res.json();
        setProfessions(Array.isArray(data) ? data : data.results ?? []);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load professions",
          variant: "destructive",
        });
      } finally {
        setLoadingProfessions(false);
      }
    };

    loadProfessions();
  }, []);

  const addSkill = () => {
    const s = currentSkill.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setCurrentSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  /* submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("Unauthenticated");

      const payload = {
        profession: Number(formData.profession),
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        county,
        constituency,
        ward,
        hourly_rate: Number(formData.hourlyRate),
        years_experience: Number(formData.yearsExperience),
        availability: formData.availability,
        skills,
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/freelancer-conversions/convert/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw await res.json();

      toast({
        title: "Profile Created",
        description: "Your freelancer profile is now live",
      });

      navigate("/dashboard/freelancer");
    } catch (err: any) {
      toast({
        title: "Creation failed",
        description:
          err?.detail || err?.non_field_errors?.[0] || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* PERSONAL */}
            <Card>
              <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                  <User className="h-5 w-5 text-primary" />
                  Personal Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="First name" required
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                  />
                  <Input placeholder="Last name" required
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                  />
                </div>

                <Textarea
                  placeholder="Bio"
                  value={formData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input type="email" placeholder="Email" required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                  <Input placeholder="Phone" required
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* LOCATION */}
            <Card>
              <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LocationSelect
                  selectedCounty={county}
                  selectedConstituency={constituency}
                  selectedWard={ward}
                  onCountyChange={setCounty}
                  onConstituencyChange={setConstituency}
                  onWardChange={setWard}
                />
              </CardContent>
            </Card>

            {/* PROFESSIONAL */}
            <Card>
              <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Professional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                <Select
                  value={formData.profession}
                  onValueChange={(v) => handleChange("profession", v)}
                  disabled={loadingProfessions}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select profession" />
                  </SelectTrigger>
                  <SelectContent>
                    {professions.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input type="number" placeholder="Hourly rate" required
                  value={formData.hourlyRate}
                  onChange={(e) => handleChange("hourlyRate", e.target.value)}
                />

                <Input type="number" placeholder="Years of experience" required
                  value={formData.yearsExperience}
                  onChange={(e) => handleChange("yearsExperience", e.target.value)}
                />

                {/* ✅ Availability dropdown */}
                <Select
                  value={formData.availability}
                  onValueChange={(v) => handleChange("availability", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* SKILLS */}
                <div>
                  <Input
                    placeholder="Add skill"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {skills.map((s) => (
                      <Badge key={s}>
                        {s}
                        <button type="button" onClick={() => removeSkill(s)} className="ml-2">
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DOCUMENTS */}
            <Card>
              <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                  <FileText className="h-5 w-5 text-primary" />
                  Documents
                </CardTitle>
                <CardDescription>
                  Upload ID, certificates, or portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button type="button" onClick={() => setShowDocsModal(true)}>
                  Manage Documents
                </Button>
              </CardContent>
            </Card>

            <motion.div className="flex justify-end">
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Creating..." : "Create Profile"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </form>
        </div>
      </main>

      {showDocsModal && (
        <FreelancerDocumentsModal
          documents={[]}
          onClose={() => setShowDocsModal(false)}
          onDocumentsUpdated={() => {}}
        />
      )}

      <Footer />
    </div>
  );
};

export default CreateFreelancerProfile;
