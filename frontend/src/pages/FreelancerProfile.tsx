import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Star,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Award,
  FileText,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { fetchFreelancerById, type Freelancer } from "@/lib/api";

const FreelancerProfile = () => {
  const { id } = useParams();
  const { getToken } = useAuth();

  const [token, setToken] = useState<string | null>(null);
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFreelancer = async () => {
      try {
        const t = await getToken({ template: "default" });
        setToken(t);

        if (!id) return;

        const data = await fetchFreelancerById(id!, t);
        setFreelancer(data);
      } catch (error) {
        console.error("Failed to load freelancer:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFreelancer();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Loading profile...
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Freelancer not found.
      </div>
    );
  }

  const initials = freelancer.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                    {initials}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                        {freelancer.name}
                      </h1>
                      <p className="text-xl text-gray-600 dark:text-gray-400 mb-3">
                        {freelancer.profession?.name || "No profession specified"}
                      </p>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center">
                          <Star className="h-5 w-5 fill-yellow-500 text-yellow-500 mr-1" />
                          <span className="font-semibold text-lg text-gray-900 dark:text-white">
                            {freelancer.rating ?? 0}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 ml-1">
                            ({freelancer.review_count ?? 0} reviews)
                          </span>
                        </div>
                        <Separator orientation="vertical" className="h-6" />
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 mr-1" />
                          {freelancer.county}, {freelancer.constituency}, {freelancer.ward}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button variant="hero" size="lg">
                        <Briefcase className="mr-2 h-4 w-4" />
                        Hire Me
                      </Button>
                      <Button variant="outline" size="lg">
                        <Mail className="mr-2 h-4 w-4" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* About */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    About Me
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {freelancer.bio || "No biography provided yet."}
                  </p>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">Skills & Expertise</h2>
                  <div className="flex flex-wrap gap-2">
                    {freelancer.skills?.length ? (
                      freelancer.skills.map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-sm">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No skills listed.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Client Reviews</h2>
                    <Button variant="hero" asChild>
                      <Link to={`/freelancer/${id}/reviews`}>Leave a Review</Link>
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {freelancer.reviews?.length ? (
                      freelancer.reviews.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-semibold">
                                {review.client_name[0]}
                              </div>
                              <div>
                                <h4 className="font-semibold">{review.client_name}</h4>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-3 w-3 ${
                                        star <= review.rating
                                          ? "fill-yellow-500 text-yellow-500"
                                          : "fill-gray-300 text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {review.created_at}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No reviews yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-bold text-lg mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    {freelancer.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{freelancer.email}</span>
                      </div>
                    )}
                    {freelancer.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{freelancer.phone}</span>
                      </div>
                    )}
                    {freelancer.location && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{freelancer.location}</span>
                      </div>
                    )}
                    {freelancer.joined_at && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Member since {new Date(freelancer.joined_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Certifications */}
              {freelancer.certifications?.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" /> Certifications
                    </h3>
                    <div className="space-y-3">
                      {freelancer.certifications.map((cert) => (
                        <div
                          key={cert}
                          className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg"
                        >
                          <FileText className="h-4 w-4 text-primary mt-0.5" />
                          <span className="text-sm">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FreelancerProfile;
