"use client";

import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";
import Link from "next/link";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has already given consent
    const cookieConsent = localStorage.getItem("cookie_consent");
    if (cookieConsent === null) {
      // No consent stored, show banner
      setShowBanner(true);
    } else {
      setConsentGiven(cookieConsent === "true");
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "true");
    setConsentGiven(true);
    setShowBanner(false);
    // Here you would enable analytics cookies
    // Example: enableAnalyticsCookies();
  };

  const handleReject = () => {
    localStorage.setItem("cookie_consent", "false");
    setConsentGiven(false);
    setShowBanner(false);
    // Ensure analytics cookies are not set
  };

  const handleClose = () => {
    // Close without setting consent (treat as reject)
    localStorage.setItem("cookie_consent", "false");
    setConsentGiven(false);
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-800 border-t border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-start gap-4">
          <Cookie className="text-emerald-400 mt-1 flex-shrink-0" size={24} />
          
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white mb-1">
              Cookie Consent
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We use cookies to enhance your experience and analyze site usage. Essential cookies are required for the Service to function. 
              You can manage your preferences in our{" "}
              <Link href="/cookies" className="text-emerald-400 hover:text-emerald-300 underline">
                Cookie Policy
              </Link>
              .
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleReject}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              Reject
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              Accept
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

