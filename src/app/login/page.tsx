"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, User, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/db/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp" | "profile">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0 && step === "otp") {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer, step]);

  // Step 1: Handle Phone Input (Numeric only, max 10)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(value);
    if (error) setError("");
  };

  // Step 2: Handle OTP Input (Numeric only, max 6)
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    if (error) setError("");
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) return;
    
    setLoading(true);
    setError("");
    
    try {
      // Proactively set the session cookie client-side
      document.cookie = `auth_session=${phone}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;

      // Sync session credentials with the backend
      const res = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || "Login failed");
      }
      
      if (data.isNewUser) {
        setStep("profile");
      } else {
        const redirect = typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("redirect") || "/") : "/";
        window.location.href = redirect;
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, fullName }),
      });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to save profile");
      }
      
      const redirect = typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("redirect") || "/") : "/";
      window.location.href = redirect;
    } catch (err: any) {
      console.error("Profile error:", err);
      setError(err.message || "Failed to complete profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex flex-col justify-center items-center p-4 selection:bg-brand-accent/30 font-inter">
      {/* Hidden container for Firebase Recaptcha */}
      <div id="recaptcha-container"></div>

      <div className="absolute top-8 left-8">
        <Link href="/" className="inline-flex items-center space-x-2 text-black/60 hover:text-black transition text-sm font-medium">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white border border-brand/10 rounded-2xl p-10 shadow-2xl border-t-8 border-t-brand-accent transform transition-all">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full overflow-hidden flex items-center justify-center bg-white border border-[#8c6239]/15 shadow-lg hover:scale-105 transition-transform duration-300">
            <img
              src="/logo.jpeg"
              alt="Dry Fish Basket Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-3xl font-playfair font-bold text-black mb-3">
            {step === "profile" ? "Welcome to Dry Fish Basket" : "Sign In"}
          </h2>
          <p className="text-black/60 text-sm leading-relaxed px-4">
            {step === "phone" && "Enter your 10-digit mobile number to access your account."}
            {step === "otp" && `We've sent a 6-digit verification code to +91 ${phone}`}
            {step === "profile" && "One last step! Tell us your name to personalize your experience."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl text-center animate-pulse">
            {error}
          </div>
        )}

        {/* STEP 1: Phone Number */}
        {step === "phone" && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-black/40 uppercase mb-2 tracking-[0.2em] ml-1">Mobile Number</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 border-r border-brand/10 pr-3">
                  <Phone size={14} className="text-black-accent" />
                  <span className="text-black font-bold text-sm">+91</span>
                </div>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="Enter 10 digits" 
                  className="w-full bg-brand/5 border-2 border-transparent focus:border-brand-accent/30 focus:bg-white rounded-xl py-4 pl-20 pr-4 text-black font-bold tracking-widest placeholder:text-black/20 placeholder:tracking-normal transition-all outline-none"
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading || phone.length !== 10} 
              className="w-full bg-brand text-white font-bold py-4 rounded-xl shadow-lg hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex justify-center items-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>Continue</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-black/40 uppercase mb-2 tracking-[0.2em] ml-1">Verification Code</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-black-accent" size={18} />
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="0 0 0 0 0 0" 
                  className="w-full bg-brand/5 border-2 border-transparent focus:border-brand-accent/30 focus:bg-white rounded-xl py-4 px-12 text-black font-mono font-bold text-center text-2xl tracking-[0.5em] placeholder:text-black/10 placeholder:tracking-normal transition-all outline-none"
                  required
                />
              </div>
              <div className="flex justify-between mt-4 px-1">
                <button type="button" onClick={() => setStep("phone")} className="text-xs text-black/40 hover:text-black font-bold transition-colors">Change Number</button>
                <button 
                  type="button" 
                  onClick={handleSendOTP}
                  disabled={timer > 0 || loading}
                  className={`text-xs font-bold ${timer > 0 ? "text-black/30 cursor-not-allowed" : "text-black-accent hover:underline"}`}
                >
                  {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading || otp.length !== 6} 
              className="w-full bg-brand text-white font-bold py-4 rounded-xl shadow-lg hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex justify-center items-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>Verify & Login</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: Profile Setup */}
        {step === "profile" && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-black/40 uppercase mb-2 tracking-[0.2em] ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-black-accent" size={18} />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Arjun Kapoor" 
                  className="w-full bg-brand/5 border-2 border-transparent focus:border-brand-accent/30 focus:bg-white rounded-xl py-4 px-12 text-black font-bold transition-all outline-none"
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading || !fullName.trim()} 
              className="w-full bg-brand text-white font-bold py-4 rounded-xl shadow-lg hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex justify-center items-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>Complete Setup</span>
              )}
            </button>
          </form>
        )}
      </div>

      <p className="mt-10 text-center text-[10px] text-black/40 max-w-xs leading-relaxed uppercase tracking-widest font-bold">
        Secure login powered by Dry Fish Basket. By continuing, you agree to our <a href="#" className="text-black hover:underline">Terms</a> & <a href="#" className="text-black hover:underline">Privacy</a>.
      </p>
    </div>
  );
}
