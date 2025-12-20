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

type Profession = {
  id: number;
  name: string;
};

const CreateFreelancerProfile = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  /* documents */
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

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
    availability: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /* load professions */
  /* load professions */
useEffect(() => {
  const loadProfessions = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/professions/`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch professions");
      }

      const data = await res.json();

      /**
       * DRF pagination safe:
       * - If pagination is enabled → data.results
       * - If pagination is disabled → data (array)
       */
      const professionsArray = Array.isArray(data)
        ? data
        : data.results ?? [];

      setProfessions(professionsArray);
    } catch (error) {
      console.error("Profession load error:", error);
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

  /* upload documents */
  const uploadDocuments = async (token: string) => {
    for (const doc of documents) {
      const form = new FormData();
      form.append("file", doc.file);
      form.append("document_type", doc.type || "other");
      form.append("title", doc.name || "");

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/freelancer-documents/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        }
      );

      if (!res.ok) throw new Error("Document upload failed");
    }
  };

  /* submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("Unauthenticated");

      /* create freelancer */
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

      const data = await res.json();
      if (!res.ok) throw data;

      /* upload documents */
      await uploadDocuments(token);

      toast({
        title: "Profile Created",
        description: "Your freelancer profile is now live",
      });

      navigate("/dashboard/freelancer");
    } catch (err: any) {
      toast({
        title: "Creation failed",
        description:
          err?.non_field_errors?.[0] ||
          err?.detail ||
          "Something went wrong",
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
                  <Input
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleChange("firstName", e.target.value)
                    }
                    required
                  />
                  <Input
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleChange("lastName", e.target.value)
                    }
                    required
                  />
                </div>

                <Textarea
                  placeholder="Bio"
                  value={formData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
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

                <Input
                  type="number"
                  placeholder="Hourly rate"
                  value={formData.hourlyRate}
                  onChange={(e) =>
                    handleChange("hourlyRate", e.target.value)
                  }
                  required
                />

                <Input
                  type="number"
                  placeholder="Years of experience"
                  value={formData.yearsExperience}
                  onChange={(e) =>
                    handleChange("yearsExperience", e.target.value)
                  }
                  required
                />

                <Input
                  placeholder="Availability (available/busy/unavailable)"
                  value={formData.availability}
                  onChange={(e) =>
                    handleChange("availability", e.target.value)
                  }
                  required
                />

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
                        <button
                          type="button"
                          onClick={() => removeSkill(s)}
                          className="ml-2"
                        >
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
                  Upload certificates or ID (optional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentUpload
                  documents={documents}
                  onDocumentsChange={setDocuments}
                  maxFiles={10}
                  maxSizeMB={5}
                />
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

      <Footer />
    </div>
  );
};

export default CreateFreelancerProfile;
