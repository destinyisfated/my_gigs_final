import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    id: 1,
    name: "Amara Okafor",
    role: "Marketing Director",
    company: "TechVentures Nigeria",
    content: "Found an amazing graphic designer within days. The quality of talent on AfriWork is exceptional!",
    rating: 5,
    avatar: "AO",
  },
  {
    id: 2,
    name: "David Kamau",
    role: "Freelance Developer",
    location: "Nairobi, Kenya",
    content: "As a freelancer, AfriWork has connected me with clients across Africa. My income has tripled!",
    rating: 5,
    avatar: "DK",
  },
  {
    id: 3,
    name: "Fatima Hassan",
    role: "Content Creator",
    location: "Cairo, Egypt",
    content: "The platform is so easy to use. I've built a solid client base and love the flexible payment options.",
    rating: 5,
    avatar: "FH",
  },
];

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate testimonials every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            What Our Community Says
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Join thousands of satisfied clients and freelancers across Africa
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Testimonial Card */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="min-w-full px-4">
                  <Card className="hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="pt-8 pb-8">
                      {/* Rating */}
                      <div className="flex justify-center mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-6 w-6 fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>

                      {/* Content */}
                      <p className="text-gray-900 dark:text-white text-center text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
                        "{testimonial.content}"
                      </p>

                      {/* Author */}
                      <div className="flex items-center justify-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl font-semibold">
                          {testimonial.avatar}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-lg text-gray-900 dark:text-white">{testimonial.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {testimonial.role}
                            {testimonial.company && `, ${testimonial.company}`}
                            {testimonial.location && ` • ${testimonial.location}`}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 rounded-full shadow-lg hover:scale-110 transition-transform"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 rounded-full shadow-lg hover:scale-110 transition-transform"
            onClick={nextSlide}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? "w-8 bg-blue-600" 
                    : "w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};