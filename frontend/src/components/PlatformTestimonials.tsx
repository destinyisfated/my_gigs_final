import { useEffect, useState } from "react";
import { useUser, useAuth, SignInButton } from "@clerk/clerk-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Star, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { ReviewForm } from "@/components/ReviewForm";

const API_BASE = "http://localhost:8000/api";

interface Testimonial {
  id: number;
  name: string;
  content: string;
  rating: number;
  avatar: string;
}

export const PlatformTestimonials = () => {
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [userTestimonial, setUserTestimonial] =
    useState<Testimonial | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* -------------------------------
     Fetch approved testimonials
  --------------------------------*/
  useEffect(() => {
    fetch(`${API_BASE}/testimonials/`)
      .then((res) => res.json())
      .then((data) => {
        setTestimonials(Array.isArray(data.results) ? data.results : []);
      })
      .catch(() => setTestimonials([]));
  }, []);

  /* -------------------------------
     Fetch user's testimonial
  --------------------------------*/
  useEffect(() => {
    if (!isSignedIn) return;

    const fetchMine = async () => {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/testimonials/?mine=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      if (data.results?.length > 0) {
        setUserTestimonial(data.results[0]);
      }
    };

    fetchMine();
  }, [isSignedIn, getToken]);

  /* -------------------------------
     Submit / Edit testimonial
  --------------------------------*/
  const handleSubmitReview = async (rating: number, content: string) => {
    if (!isSignedIn) return;

    setErrorMessage(null);

    try {
      const token = await getToken();
      const isEditing = Boolean(userTestimonial);

      const url = isEditing
        ? `${API_BASE}/testimonials/${userTestimonial!.id}/`
        : `${API_BASE}/testimonials/`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(
          data?.detail || "Something went wrong while submitting your review."
        );
        return;
      }

      setUserTestimonial(data);
      setIsDialogOpen(false);
    } catch {
      setErrorMessage("Network error. Please try again.");
    }
  };

  /* -------------------------------
     Slider controls
  --------------------------------*/
  const nextSlide = () =>
    setCurrentIndex((i) => (i + 1) % testimonials.length);

  const prevSlide = () =>
    setCurrentIndex((i) =>
      i === 0 ? testimonials.length - 1 : i - 1
    );

  if (!testimonials.length) return null;

  /* -------------------------------
     UI
  --------------------------------*/
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">
          What Our Community Says
        </h2>

        {/* Slider */}
        <div className="relative max-w-3xl mx-auto">
          <Card className="overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                {Array.from({
                  length: testimonials[currentIndex].rating,
                }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-6 w-6 fill-yellow-500 text-yellow-500"
                  />
                ))}
              </div>

              <p className="text-lg mb-6">
                “{testimonials[currentIndex].content}”
              </p>

              <div className="flex items-center justify-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {testimonials[currentIndex].avatar}
                </div>
                <span className="font-semibold">
                  {testimonials[currentIndex].name}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <Button
            size="icon"
            variant="outline"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4"
            onClick={prevSlide}
          >
            <ChevronLeft />
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4"
            onClick={nextSlide}
          >
            <ChevronRight />
          </Button>
        </div>

        {/* Action */}
        <div className="text-center mt-10">
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <Button size="lg">Sign in to leave a testimonial</Button>
            </SignInButton>
          ) : (
            <Button
              size="lg"
              onClick={() => setIsDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-5 w-5" />
              {userTestimonial
                ? "Edit testimonial"
                : "Share your experience"}
            </Button>
          )}

          {errorMessage && (
            <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
          )}
        </div>

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-xl">
            <ReviewForm
              onSubmit={handleSubmitReview}
              title={
                userTestimonial
                  ? "Thankkyou for sharing your experience"
                  : "Share Your Experience"
              }
            />
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};
