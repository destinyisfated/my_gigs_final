import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ReviewCard, Review } from "@/components/ReviewCard";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewStats } from "@/components/ReviewStats";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

// API
import {
  fetchReviewsByFreelancer,
  createReview,
  // markReviewHelpful,
  // addReviewReply
} from "@/lib/api";

// Map Django response → Frontend Review type
function mapBackendReview(review: any): Review {
  return {
    id: review.id.toString(),
    author: review.client_name,
    authorInitials: review.client_avatar,
    role: "Client", // you can change this later if needed
    rating: review.rating,
    content: review.content,
    date: new Date(review.created_at).toLocaleDateString(),
    helpful: review.helpful_count,
    verified: true,
    replies: review.reply
      ? [
          {
            id: `reply-${review.id}`,
            author: review.client_name,
            authorInitials: review.client_avatar,
            date: new Date(review.created_at).toLocaleDateString(),
            content: review.reply,
          },
        ]
      : [],
  };
}

const FreelancerReviews = () => {
  const { id } = useParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        setLoading(true);

        const response = await fetchReviewsByFreelancer(parseInt(id));

        // Your backend returns a paginated format
        const mapped = response.results.map(mapBackendReview);

        setReviews(mapped);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to load reviews.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  const ratingDistribution = reviews.reduce(
    (acc, r) => {
      acc[r.rating]++;
      return acc;
    },
    { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  );

  // POST new review
  const handleSubmitReview = async (rating: number, content: string) => {
    if (!id) return;

    try {
      const created = await createReview(parseInt(id), {
        rating,
        content,
      });

      // Map backend → frontend format
      const newReview = mapBackendReview(created);

      setReviews([newReview, ...reviews]);

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to submit review.",
        variant: "destructive",
      });
    }
  };

  // Future backend integration (when endpoints exist)
  const handleHelpful = async (reviewId: string) => {
    setReviews(
      reviews.map((r) =>
        r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
      )
    );
  };

  const handleReply = async (reviewId: string, content: string) => {
    setReviews(
      reviews.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              replies: [
                ...r.replies,
                {
                  id: Date.now().toString(),
                  author: "You",
                  authorInitials: "Y",
                  date: "Just now",
                  content,
                },
              ],
            }
          : r
      )
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" className="mb-6 gap-2" asChild>
            <Link to={`/freelancer/${id}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Client Reviews</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Real feedback from clients who worked with this freelancer
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <ReviewStats
                totalReviews={totalReviews}
                averageRating={averageRating}
                ratingDistribution={ratingDistribution}
              />

              <ReviewForm onSubmit={handleSubmitReview} />
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-bold mb-4">
                All Reviews ({reviews.length})
              </h2>

              {loading ? (
                <div className="py-10 text-center text-gray-500">
                  Loading reviews...
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No reviews yet. Be the first to review!
                </div>
              ) : (
                reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onReply={handleReply}
                    onHelpful={handleHelpful}
                    showReplyButton={true}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FreelancerReviews;
