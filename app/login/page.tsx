"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { startGuestSession } from "@/lib/guestSession";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  async function handleGoogleLogin() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  }

  function handleGuest() {
    startGuestSession();
    router.push("/editor");
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", fontFamily: "'Space Grotesk', sans-serif" }}>
      <h1>Login</h1>

      <button onClick={handleGoogleLogin} style={{ width: "100%", marginBottom: 16, padding: 10 }}>
        Continue with Google
      </button>

      <div style={{ textAlign: "center", margin: "12px 0", opacity: 0.6 }}>or</div>

      {sent ? (
        <p>Login link has been sent to {email}. Please check your inbox.</p>
      ) : (
        <form onSubmit={handleMagicLink}>
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          />
          <button type="submit" style={{ width: "100%", padding: 10 }}>
            Send Login Link
          </button>
        </form>
      )}

      <div style={{ textAlign: "center", margin: "20px 0", opacity: 0.6 }}>or</div>

      <button
        onClick={handleGuest}
        style={{
          width: "100%",
          padding: 10,
          background: "transparent",
          border: "1px solid #ccc",
          borderRadius: 8,
        }}
      >
        Continue as Guest
      </button>

      <p style={{ fontSize: 13, color: "#888", marginTop: 8, textAlign: "center" }}>
        No account required. You have 15 minutes of access, and chats won't be saved.
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
