// Referral Store - Manages referral state across the payment flow
// Simple state management for referral tracking

import { useState, useEffect } from "react";

interface ReferralState {
  referralCode: string | null;
  salesPersonId: string | null;
  salesPersonName: string | null;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
}

// Simple global state (no external dependencies)
let referralState: ReferralState = {
  referralCode: null,
  salesPersonId: null,
  salesPersonName: null,
  clientName: null,
  clientEmail: null,
  clientPhone: null,
};

const listeners = new Set<() => void>();

// Hook to use referral state in components
export const useReferralStore = () => {
  const [state, setState] = useState<ReferralState>(referralState);

  useEffect(() => {
    const listener = () => setState({ ...referralState });
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return state;
};

// Action: Set referral code
export const setReferralCode = (
  code: string,
  salesPersonId: string,
  salesPersonName: string
) => {
  referralState = {
    ...referralState,
    referralCode: code,
    salesPersonId,
    salesPersonName,
  };
  listeners.forEach((l) => l());
};

// Action: Set client info
export const setClientInfo = (name: string, email: string, phone: string) => {
  referralState = {
    ...referralState,
    clientName: name,
    clientEmail: email,
    clientPhone: phone,
  };
  listeners.forEach((l) => l());
};

// Action: Clear all referral data
export const clearReferral = () => {
  referralState = {
    referralCode: null,
    salesPersonId: null,
    salesPersonName: null,
    clientName: null,
    clientEmail: null,
    clientPhone: null,
  };
  listeners.forEach((l) => l());
};

// Get current state (for non-React code)
export const getReferralState = () => ({ ...referralState });
