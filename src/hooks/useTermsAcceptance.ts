"use client";

import { useState } from "react";

export const useTermsAcceptance = () => {
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);

  return {
    acceptedTerms,
    setAcceptedTerms,
  };
};
