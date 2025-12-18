import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import JoinModal from "./JoinModal";

// Import your images (using placeholders for the slider demo)
import heroImage1 from "@/assets/hero-freelancers.jpg";
// import heroImage2 from "@/assets/hero-2.jpg";
// import heroImage3 from "@/assets/hero-3.jpg";

const HERO_IMAGES = [
  heroImage1,
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=cover", // African team example
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=cover", // Collaboration example
];

export const Hero = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { user, isLoaded } = useUser();
  const role = user?.publicMetadata?.role as string | undefined;
  const isFreelancerOrAdmin = role === "freelancer" || role === "admin";

  // --- SLIDER LOGIC ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000); // Change image every 6 seconds
    return () => clearInterval(timer);
  }, []);

  // --- ORIGINAL LOGIC ---
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/browse");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <>
      <JoinModal open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen} />
      <section className="relative h-[90vh] min-h-[600px] overflow-hidden flex items-center">
        {/* Animated Background Slider */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage}
              src={HERO_IMAGES[currentImage]}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover"
              alt="African freelancers background"
            />
          </AnimatePresence>

          {/* Enhanced Visibility Overlay */}
          {/* Light mode: Changed white/95 to white/70 for better image visibility */}
          <div
            className="absolute inset-0 bg-gradient-to-r 
            from-white/70 via-white/50 to-transparent 
            dark:from-gray-950/95 dark:via-gray-950/80 dark:to-gray-950/60"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">
              Connect with Africa's
              <span className="block bg-gradient-to-r from-orange-600 via-amber-600 to-teal-600 bg-clip-text text-transparent">
                Top Talent
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-800 dark:text-gray-400 mb-8 max-w-2xl font-medium md:font-normal">
              Link with local and professional freelancers across Africa. Find
              the perfect talent for your project or grow your freelance career
              today.
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search for skills, services, or freelancers..."
                  className="pl-10 h-14 bg-white/80 dark:bg-gray-950/50 backdrop-blur-md border-gray-200 dark:border-gray-800 text-lg shadow-xl"
                />
              </div>
              <Button
                variant="default"
                size="lg"
                onClick={handleSearch}
                className="h-14 px-8 bg-orange-600 hover:bg-orange-700 text-white"
              >
                Search
              </Button>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                className="px-8 h-12 text-md"
                variant="secondary"
                size="lg"
                asChild
              >
                <Link to="/browse">Find Freelancers</Link>
              </Button>

              {isLoaded && !isFreelancerOrAdmin && (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="h-12 bg-white/50 dark:bg-gray-950/50 backdrop-blur border-gray-300"
                  >
                    <Link to="/post-job">Post a Job</Link>
                  </Button>

                  <Button
                    size="lg"
                    className="h-12 bg-blue-600 hover:bg-blue-700 font-bold px-8"
                    onClick={() => setIsJoinModalOpen(true)}
                  >
                    Become a Freelancer
                  </Button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-gray-900/10 dark:border-gray-800/50">
              {[
                { val: "10K+", label: "Freelancers" },
                { val: "5K+", label: "Jobs Posted" },
                { val: "47", label: "Countries" },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.val}
                  </div>
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-1 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};
