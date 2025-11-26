import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-freelancers.jpg";
import { MpesaPaymentModal } from "./MpesaPaymentModal";
// 1. Import the Clerk hook
import { useUser } from "@clerk/clerk-react";

export const Hero = () => {
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // 2. Get user details
  const { user, isLoaded } = useUser();

  // 3. Extract the role safely (assuming it's stored in publicMetadata)
  // You might need to adjust 'role' string values based on your database setup
  const role = user?.publicMetadata?.role as string | undefined;

  // 4. Define the logic
  const isFreelancerOrAdmin = role === "freelancer" || role === "admin";

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/browse");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      <MpesaPaymentModal
        open={showMpesaModal}
        onOpenChange={setShowMpesaModal}
      />
      <section className="relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="African freelancers collaborating"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/60 dark:from-gray-950/95 dark:via-gray-950/80 dark:to-gray-950/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">
              Connect with Africa's
              <span className="block bg-gradient-to-r from-orange-500 via-amber-500 to-teal-500 bg-clip-text text-transparent">
                Top Talent
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
              Link with local and professional freelancers across Africa. Find
              the perfect talent for your project or grow your freelance career
              today.
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search for skills, services, or freelancers..."
                  className="pl-10 h-12 bg-white/50 dark:bg-gray-950/50 backdrop-blur border-gray-200 dark:border-gray-800"
                />
              </div>
              <Button variant="hero" size="lg" onClick={handleSearch}>
                Search
              </Button>
            </div>

            {/* CTA Buttons - CONDITIONAL RENDERING APPLIED HERE */}
            <div className="flex flex-wrap gap-4">
              {/* Everyone sees Find Freelancers, or specifically emphasized for Admins/Freelancers */}
              <Button className="w-full" variant="secondary" size="lg" asChild>
                <Link to="/browse">Find Freelancers</Link>
              </Button>

              {/* Only show these if the user is NOT a freelancer or admin */}
              {/* Checks if loaded first to prevent hydration flicker */}
              {isLoaded && !isFreelancerOrAdmin && (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="bg-white/50 dark:bg-gray-950/50 backdrop-blur"
                  >
                    <Link to="/post-job">Post a Job</Link>
                  </Button>

                  <Button
                    variant="accent"
                    size="lg"
                    onClick={() => setShowMpesaModal(true)}
                  >
                    Become a Freelancer
                  </Button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-gray-200/50 dark:border-gray-800/50">
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  10K+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Freelancers
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  5K+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Jobs Posted
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  47
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Countries
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
