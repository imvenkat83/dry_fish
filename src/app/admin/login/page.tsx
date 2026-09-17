"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Phone, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/db/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

export default function AdminLogin() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {}
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(value);
    if (error) setError("");
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    if (error) setError("");
  };


  const getFirebaseErrorMessage = (err: any) => {
    const code = err?.code || "";
    switch (code) {
      case "auth/invalid-app-credential":
        return "Invalid Firebase App Credentials or API Key. Please verify your NEXT_PUBLIC_FIREBASE_* keys in .env and restart your dev server.";
      case "auth/invalid-phone-number":
        return "The phone number entered is invalid. Please enter a valid 10-digit mobile number.";
      case "auth/too-many-requests":
        return "Too many requests. Please wait a few minutes before trying again.";
      case "auth/invalid-verification-code":
        return "Incorrect verification code. Please check and try again.";
      case "auth/code-expired":
        return "Verification code has expired. Please request a new code.";
      case "auth/captcha-check-failed":
        return "reCAPTCHA verification failed. Please check your Firebase authorized domains.";
      default:
        return err?.message || "An authentication error occurred. Please try again.";
    }
  };


  const setupRecaptcha = () => {
    if (!auth) {
      throw new Error("Firebase Auth is not initialized. Please verify your client configuration.");
    }

    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }

    const container = document.getElementById("recaptcha-container");
    if (container) {
      container.innerHTML = "";
    }

    try {
      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
      recaptchaVerifierRef.current = verifier;
      return verifier;
    } catch (e: any) {
      console.warn("Admin recaptcha setup warning, resetting container:", e?.message);
      if (container) {
        container.innerHTML = "";
      }
      try {
        const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
        });
        recaptchaVerifierRef.current = verifier;
        return verifier;
      } catch (retryErr: any) {
        console.error("Admin recaptcha retry failed:", retryErr);
        throw new Error(retryErr.message || "Failed to initialize reCAPTCHA verifier.");
      }
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) return;

    setLoading(true);
    setError("");

    try {
      // Query server-side check-admin endpoint to keep admin numbers hidden from client
      const checkRes = await fetch("/api/auth/check-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const checkData = await checkRes.json();

      if (!checkData.success || !checkData.isAdmin) {
        setError("Unauthorized phone number. This portal is for administrators only.");
        setLoading(false);
        return;
      }

      const appVerifier = setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, `+91${phone}`, appVerifier);
      setConfirmationResult(confirmation);
      setStep("otp");
    } catch (err: any) {
      console.error("OTP Send Error:", err);
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (_) {}
        recaptchaVerifierRef.current = null;
      }
      const container = document.getElementById("recaptcha-container");
      if (container) {
        container.innerHTML = "";
      }
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };


  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setLoading(true);
    setError("");

    try {
      if (!confirmationResult) {
        throw new Error("No active verification session. Please request a new code.");
      }

      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();

      // Sync administrative session cookies with the backend
      const res = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, idToken }),
      });
      const data = await res.json();

      if (data.success) {
        router.push("/admin/navigation");
        router.refresh();
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch (err: any) {
      console.error("Verification failed:", err);
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };




  return (
    <div className="min-h-screen bg-[#8c6239] flex flex-col justify-center items-center p-4 font-inter">
      {/* Hidden container for Firebase Recaptcha */}
      <div id="recaptcha-container"></div>

      <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl border-t-[12px] border-t-[#C5A059] relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#C5A059]/5 rounded-full blur-3xl"></div>

        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#8c6239] flex items-center justify-center shadow-2xl relative">
            <Lock className="text-[#C5A059]" size={32} />
            <div className="absolute -bottom-2 -right-2 bg-[#C5A059] p-1.5 rounded-lg shadow-lg">
              <ShieldCheck size={16} className="text-[#8c6239]" />
            </div>
          </div>
          <h2 className="text-3xl font-playfair font-bold text-[#8c6239] mb-3">
            Admin Portal
          </h2>
          <p className="text-[#8c6239]/60 text-sm font-medium uppercase tracking-widest">
            {step === "phone" ? "Authorization Required" : "Security Verification"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl text-center">
            {error}
          </div>
        )}

        {/* STEP 1: Phone Number */}
        {step === "phone" && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-[#8c6239]/40 uppercase mb-2 tracking-[0.2em] ml-1">Admin Phone</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 border-r border-[#8c6239]/10 pr-3">
                  <Phone size={14} className="text-[#C5A059]" />
                  <span className="text-[#8c6239] font-bold text-sm">+91</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  placeholder="9999999999"
                  className="w-full bg-[#8c6239]/5 border-2 border-transparent focus:border-[#C5A059]/30 focus:bg-white rounded-xl py-4 pl-20 pr-4 text-[#8c6239] font-bold tracking-widest transition-all outline-none"
                  required
                />

              </div>
            </div>
            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full bg-[#8c6239] text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-[#734f2d] disabled:opacity-50 transition-all active:scale-95 flex justify-center items-center space-x-2 group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="uppercase tracking-[0.2em] text-xs">Request Access</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-[#8c6239]/40 uppercase mb-2 tracking-[0.2em] ml-1">Security Code</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A059]" size={18} />
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="123456"
                  className="w-full bg-[#8c6239]/5 border-2 border-transparent focus:border-[#C5A059]/30 focus:bg-white rounded-xl py-4 px-12 text-[#8c6239] font-mono font-bold text-center text-2xl tracking-[0.5em] transition-all outline-none"
                  required
                />
              </div>
              <div className="flex justify-center mt-4">
                <button type="button" onClick={() => setStep("phone")} className="text-[10px] text-[#8c6239]/40 hover:text-[#8c6239] font-black uppercase tracking-widest transition-colors">Use different account</button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-[#C5A059] text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-[#b39150] disabled:opacity-50 transition-all active:scale-95 flex justify-center items-center space-x-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="uppercase tracking-[0.2em] text-xs">Authorize Entry</span>
              )}
            </button>
          </form>
        )}
      </div>

      <p className="mt-10 text-center text-[10px] text-white/30 max-w-xs leading-relaxed uppercase tracking-[0.3em] font-bold">
        Dry Fish Basket Management Infrastructure
      </p>
    </div>
  );
}
