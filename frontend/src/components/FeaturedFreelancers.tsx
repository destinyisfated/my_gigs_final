import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchFeaturedFreelancers } from "@/lib/api";

/* ================================
   Types
================================ */

interface Freelancer {
  id: number;
  name: string;
  title: string;
  county: string;
  constituency: string;
  ward: string;
  rating: number | null;
  review_count: number;
  avatar_url?: string | null;
}

/* ================================
   Component
================================ */

export const FeaturedFreelancers = () => {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFreelancers() {
      try {
        const data = await fetchFeaturedFreelancers();
        setFreelancers(data);
      } catch (error) {
        console.error("Failed to fetch featured freelancers:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFreelancers();
  }, []);

  if (loading) {
    return null;
  }

const formatLocation = (freelancer: Freelancer) => {
  return [freelancer.ward, freelancer.constituency, freelancer.county]
    .filter(Boolean)
    .join(", ");
};


  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/30 dark:to-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Featured Freelancers
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Meet top-rated professionals ready to bring your projects to life
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {freelancers.map((freelancer) => {
            const rating = freelancer.rating ?? 0;
            const reviews = freelancer.review_count ?? 0;

            return (
              <Card
                key={freelancer.id}
                className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900 border-gray-200 dark:border-gray-800"
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardHeader className="pb-4 relative z-10">
                  <div className="flex flex-col items-center text-center mb-4">
                    {/* Avatar */}
                    <div className="relative mb-4">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 via-amber-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {freelancer.name
                          .split(" ")
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("")}
                      </div>
                    </div>

                    <CardTitle className="text-lg font-bold mb-1 text-gray-900 dark:text-white">
                      {freelancer.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {freelancer.title}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-center gap-1 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg py-2 px-3 border border-amber-200 dark:border-amber-800">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span className="font-bold text-gray-900 dark:text-white">
                      {rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      ({reviews} reviews)
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 relative z-10">
                  {/* Location */}
                  <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg py-2 px-3 text-center">
                    <MapPin className="h-4 w-4 mr-2 text-orange-500 shrink-0" />
                    <span>
                      {freelancer.ward}, {freelancer.constituency},{" "}
                      {freelancer.county}
                    </span>
                      {/* {formatLocation(freelancer)} */}
                  </div>

                  {/* CTA */}
                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    asChild
                  >
                    <Link to={`/freelancer/${freelancer.id}`}>
                      View Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button variant="hero" size="lg" asChild>
            <Link to="/browse">View All Freelancers</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
