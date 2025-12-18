// src/components/BecomeFreelancerButton.tsx
import { Button } from "@/components/ui/button";

interface BecomeFreelancerButtonProps {
  onClick: () => void;
}

export const BecomeFreelancerButton = ({ onClick }: BecomeFreelancerButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant="default"
      className="bg-primary text-white hover:bg-primary/90"
    >
      Become a Freelancer
    </Button>
  );
};
