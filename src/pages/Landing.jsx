import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import IntelligenceSection from "../components/landing/IntelligenceSection";
import RolesSection from "../components/landing/RolesSection";
import FlowSection from "../components/landing/FlowSection";
import CTASection from "../components/landing/CTASection";
import Footer from "../components/landing/Footer";

export default function Landing() {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if the user is already logged in
    const token = localStorage.getItem("access_token");

    if (token) {
      try {
        // Decode the JWT to find out the user's role
        const tokenPayload = JSON.parse(atob(token.split(".")[1]));
        const userRole = tokenPayload.role; // Make sure this matches your Django JWT claim

        // Auto-redirect to their specific dashboard
        if (userRole === "Global Admin") navigate("/global-admin");
        else if (userRole === "School Admin") navigate("/school-admin");
        else if (userRole === "Teacher") navigate("/teacher");
        else if (userRole === "Student") navigate("/student");
        else if (userRole === "Parent") navigate("/parent");
        else {
          setIsCheckingAuth(false);
        }
      } catch (error) {
        // If token is invalid or expired, just stay on the landing page
        console.error("Invalid token format", error);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setIsCheckingAuth(false);
      }
    } else {
      setIsCheckingAuth(false);
    }
  }, [navigate]);

  // Optional: Show a tiny loading state while we check their token
  // so the landing page doesn't flash on the screen before redirecting
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <Hero />
      <IntelligenceSection />
      <RolesSection />
      <FlowSection />
      <CTASection />
      <Footer />
    </div>
  );
}
