import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { toast } from "@/hooks/use-toast";

interface BecomeFreelancerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionAmount?: number; // default subscription fee
}

export const BecomeFreelancerModal = ({
  isOpen,
  onClose,
  subscriptionAmount = 1000, // Example amount in KES
}: BecomeFreelancerModalProps) => {
  const { user } = useUser();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!phoneNumber.match(/^254\d{9}$/)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number in the format 2547XXXXXXXX.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Not Authenticated",
        description: "You must be logged in to subscribe.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/api/mpesa/stkpush/", {
        phone_number: phoneNumber,
        amount: subscriptionAmount,
        clerk_id: user.id,
      });

      toast({
        title: "STK Push Initiated",
        description:
          "Check your phone and complete the payment to become a freelancer.",
      });
      onClose();
    } catch (error: any) {
      if (error.response?.data?.detail) {
        toast({
          title: "Payment Failed",
          description: error.response.data.detail,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
      console.error("STK Push Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Become a Freelancer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p>
            Pay the subscription fee to unlock your freelancer profile and start
            getting hired!
          </p>

          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <Input
              placeholder="2547XXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              maxLength={12}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subscription Amount</label>
            <Input
              value={subscriptionAmount}
              disabled
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? "Processing..." : "Pay & Become Freelancer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
