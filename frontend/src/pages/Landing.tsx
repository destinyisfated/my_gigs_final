import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { FeaturedFreelancers } from "@/components/FeaturedFreelancers";
import { PlatformTestimonials } from "@/components/PlatformTestimonials";
import { Footer } from "@/components/Footer";

// Import the components we created
import { BecomeFreelancerButton } from "@/components/BecomeFreelancerButton";
import { BecomeFreelancerModal } from "@/components/BecomeFreelancerModal";

const Landing = () => {
  // State to control modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />

      {/* Featured Freelancers Section */}
      <div className="my-10 container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Freelancers</h2>
          {/* Button to trigger Become Freelancer modal */}
          <BecomeFreelancerButton onClick={() => setIsModalOpen(true)} />
        </div>
        <FeaturedFreelancers />
      </div>

      {/* Testimonials Section */}
      <PlatformTestimonials />

      {/* Become Freelancer Modal */}
      <BecomeFreelancerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <Footer />
    </div>
  );
};

export default Landing;
