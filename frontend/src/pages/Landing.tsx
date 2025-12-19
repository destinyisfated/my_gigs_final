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
      <FeaturedFreelancers />
      <PlatformTestimonials />
      <Footer />
    </div>
  );
};

export default Landing;
