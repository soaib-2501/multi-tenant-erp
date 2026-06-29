import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearCacheAndInitProfile } from "../hooks/useStaleData";

export default function Login() {
  const navigate = useNavigate();

  // State for the real API login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Real backend API login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      // Use the base URL from the .env file (supports both Vite and Create React App)
      // No hardcoded fallback – environment variable must be set
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
      
      console.log("Attempting login to:", `${baseUrl}/api/v1/auth/login/`);
      
      // --- STEP 1: GET THE TOKENS ---
      const loginRes = await fetch(`${baseUrl}/api/v1/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      let loginData;
      try {
        loginData = await loginRes.json();
      } catch (jsonErr) {
        throw new Error("Received non-JSON response from server during login.");
      }

      if (!loginRes.ok) {
        throw new Error(loginData.detail || "Invalid credentials");
      }

      if (!loginData.access) {
        throw new Error("No access token found in the response.");
      }

      // Save the tokens securely in local storage
      localStorage.setItem("access_token", loginData.access);
      localStorage.setItem("refresh_token", loginData.refresh);
      console.log("Tokens saved successfully!");

      // --- STEP 2: FETCH USER PROFILE DETAILS ---
      console.log("Fetching user profile from:", `${baseUrl}/api/v1/profiles/me/`);
      
      const profileRes = await fetch(`${baseUrl}/api/v1/profiles/me/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${loginData.access}`
        }
      });

      let profileData;
      try {
        profileData = await profileRes.json();
      } catch (jsonErr) {
        throw new Error("Received non-JSON response from server while fetching profile.");
      }

      if (!profileRes.ok) {
        throw new Error("Successfully logged in, but failed to fetch user profile details.");
      }

      console.log("Profile Data API Response:", profileData);
      
      // Save user details in local storage
      localStorage.setItem('user_data', JSON.stringify(profileData));
      
      // Clear SWR cache and initialize with the new profile data
      clearCacheAndInitProfile(profileData);
      
      // --- STEP 3: NAVIGATE BASED ON USER TYPE ---
      // Extract the primary role from the roles array (which contains strings like "School Admin") 
      // Fallback to checking the profiles object (e.g. if teacher profile exists)
      // Fallback to "Global Admin" if is_superuser is true
      let mainRole = "";
      
      if (profileData.roles && profileData.roles.length > 0) {
        mainRole = profileData.roles[0];
      } else if (profileData.profiles?.teacher?.exists) {
        mainRole = "Teacher";
      } else if (profileData.profiles?.student?.exists) {
        mainRole = "Student";
      } else if (profileData.profiles?.parent?.exists) {
        mainRole = "Parent";
      } else if (profileData.is_superuser) {
        mainRole = "Global Admin";
      }

      const lowerRole = mainRole.toLowerCase();

      if (lowerRole.includes("global")) {
        navigate("/global-admin");
      } else if (lowerRole.includes("school")) {
        navigate("/school-admin");
      } else if (lowerRole.includes("teacher")) {
        navigate("/teacher/dashboard");
      } else if (lowerRole.includes("student")) {
        navigate("/student");
      } else if (lowerRole.includes("parent")) {
        navigate("/parent");
      } else {
        console.warn("No matching role/profile found:", profileData);
        // Default fallback
        navigate("/student");
      }
    } catch (err) {
      console.error("Login Error Caught:", err);
      if (err.message === "Failed to fetch") {
        setError("Network Error: Cannot connect to the server. Please check if the backend is running and CORS is configured.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-body text-on-surface">
      {/* HEADER */}
      <header className="w-full flex justify-between items-center px-8 py-4">
        <h1 className="text-xl font-headline font-bold text-primary">
          Academic Architect
        </h1>
        <Link to="/" className="text-sm text-gray-500 flex items-center gap-1">
          ← Back to Home
        </Link>
      </header>

      {/* MAIN SECTION */}
      <main className="flex items-center justify-center px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl w-full items-center">
          
          {/* LEFT SIDE */}
          <div className="hidden md:block">
            <h1 className="text-5xl font-headline font-extrabold leading-tight mb-6">
              Elevating
              <span className="text-primary"> Academic</span>
              <br />
              Intelligence.
            </h1>
            <p className="text-on-surface-variant text-lg max-w-md mb-8">
              Experience a high-end digital workspace designed for the modern
              educational ecosystem. Seamless, secure, and smart.
            </p>

            <div className="bg-surface-container-low p-6 rounded-xl">
              <div className="flex gap-3 items-center">
                <div className="bg-white p-2 rounded-md">
                  <span className="material-symbols-outlined text-primary">
                    verified_user
                  </span>
                </div>
                <div>
                  <p className="font-semibold">Secure Access</p>
                  <p className="text-sm text-on-surface-variant">
                    256-bit SSL Encryption Active
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* LOGIN CARD */}
          <div className="max-w-md w-full mx-auto">
            <div className="bg-white p-10 rounded-lg ambient-shadow">
              <h2 className="text-3xl font-headline font-bold mb-2">
                Login to AI School ERP
              </h2>
              <p className="text-on-surface-variant mb-6">
                Access your personalized dashboard securely.
              </p>

              {/* REAL API FORM */}
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm mb-4">
                    {error}
                  </div>
                )}

                <div>
                  <label className="text-sm font-semibold">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="w-full mt-2 px-4 py-3 rounded-md bg-surface-container-low outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <label className="text-sm font-semibold">Password</label>
                    <span className="text-xs text-primary cursor-pointer hover:underline">
                      Forgot Password?
                    </span>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full mt-2 px-4 py-3 rounded-md bg-surface-container-low outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember" className="text-sm text-on-surface-variant cursor-pointer">
                    Remember me
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full py-4 primary-gradient text-white font-bold rounded-md shadow-lg transition-opacity ${loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"}`}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="text-center text-xs text-gray-400 pb-8">
        Secure login powered by encrypted authentication.
        <br />© 2024 Academic Architect
      </footer>
    </div>
  );
}