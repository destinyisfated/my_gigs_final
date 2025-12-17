import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { createTestimonial } from "@/lib/api";
import { useAuth } from "@clerk/clerk-react";

interface Props {
  onSuccess: () => void;
}

export const TestimonialForm = ({ onSuccess }: Props) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const { getToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    setLoading(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      await createTestimonial({ rating, content }, token);

      setContent("");
      onSuccess(); // 🔁 refetch testimonials
    } catch (err) {
      console.error(err);
      alert("Failed to submit testimonial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Rating */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`h-6 w-6 cursor-pointer ${
              n <= rating
                ? "fill-yellow-500 text-yellow-500"
                : "text-gray-300"
            }`}
            onClick={() => setRating(n)}
          />
        ))}
      </div>

      {/* Content */}
      <Textarea
        placeholder="Share your experience..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Testimonial"}
      </Button>
    </form>
  );
};
