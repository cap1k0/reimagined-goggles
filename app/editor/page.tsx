"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  getGuestSession,
  getGuestTimeRemaining,
  isGuestExpired,
  clearGuestSession,
} from "@/lib/guestSession";

type Change = {
  original: string;
  revised: string;
  type: string;
  reason: string;
};

type EditResult = {
  session_id: string;
  edited_text: string;
  changes: Change[];
};

const TYPE_LABELS: Record<string, string> = {
  grammar: "Grammar",
  vocabulary: "Vocabulary",
  style: "Style",
  clarity: "Clarity",
  cohesion: "Cohesion",
  formality: "Formality",
  hedging: "Hedging",
  conciseness: "Conciseness",
  citation_language: "Citation Language",
  punctuation: "Punctuation",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditorPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [expired, setExpired] = useState(false);

  const [input, setInput] = useState("");
  const [result, setResult] = useState<EditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setIsGuest(false);
        setChecking(false);
        return;
      }

      const guest = getGuestSession();

      if (!guest) {
        router.replace("/login");
        return;
      }

      if (isGuestExpired(guest)) {
        setExpired(true);
        setChecking(false);
        return;
      }

      setIsGuest(true);
      setGuestId(guest.guestId);
      setRemainingMs(getGuestTimeRemaining(guest));
      setChecking(false);
    }

    check();
  }, [router]);

  useEffect(() => {
    if (!isGuest) return;

    const interval = setInterval(() => {
      const guest = getGuestSession();

      if (!guest || isGuestExpired(guest)) {
        setExpired(true);
        clearInterval(interval);
        return;
      }

      setRemainingMs(getGuestTimeRemaining(guest));
    }, 1000);

    return () => clearInterval(interval);
  }, [isGuest]);

  async function handleSubmit() {
    if (!input.trim() || expired) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: input,
          user_id: isGuest ? guestId : undefined,
          is_guest: isGuest,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      setResult(await res.json());
    } catch (e) {
      setError("The model did not respond. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) return null;

  if (expired) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: 24,
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        <h2 style={{ marginBottom: 12 }}>Guest session expired</h2>

        <p style={{ color: "#666", maxWidth: 400, marginBottom: 20 }}>
          Chats are not saved without an account. Create an account to continue.
        </p>

        <button
          onClick={() => {
            clearGuestSession();
            router.push("/login");
          }}
          style={{
            background: "#0a0a0a",
            color: "#fff",
            padding: "12px 28px",
            borderRadius: 10,
            border: "none",
            fontWeight: 600,
          }}
        >
          Create Account
        </button>
      </main>
    );
  }

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "48px 24px",
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      }}
    >
      {isGuest && (
        <div
          style={{
            background: "#fff8e1",
            border: "1px solid #ffe082",
            borderRadius: 10,
            padding: "10px 16px",
            marginBottom: 24,
            fontSize: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            Guest mode — {minutes}:{seconds.toString().padStart(2, "0")} remaining.
            Chats are not saved.
          </span>

          <a href="/login" style={{ fontWeight: 600 }}>
            Create Account
          </a>
        </div>
      )}

      <h1 style={{ marginBottom: 24 }}>Academic Text Editor</h1>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste your academic text here..."
        rows={10}
        disabled={expired}
        style={{
          width: "100%",
          padding: 16,
          borderRadius: 12,
          border: "1px solid #ddd",
          fontSize: 16,
          lineHeight: 1.7,
          marginBottom: 16,
          resize: "vertical",
        }}
      />

      <button
        onClick={handleSubmit}
        disabled={loading || expired}
        style={{
          background: "#0a0a0a",
          color: "#fff",
          padding: "12px 28px",
          borderRadius: 10,
          fontWeight: 600,
          border: "none",
          cursor: loading ? "default" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Analyzing..." : "Edit"}
      </button>

      {error && <p style={{ color: "red", marginTop: 16 }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>Edited Text</h2>

          <p
            style={{
              background: "#f7f7f7",
              padding: 16,
              borderRadius: 12,
              lineHeight: 1.8,
              marginBottom: 32,
            }}
          >
            {result.edited_text}
          </p>

          <h2 style={{ fontSize: 20, marginBottom: 12 }}>
            Changes ({result.changes.length})
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {result.changes.map((c, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    background: "#eee",
                    borderRadius: 999,
                    padding: "2px 10px",
                    marginBottom: 8,
                    display: "inline-block",
                  }}
                >
                  {TYPE_LABELS[c.type] ?? c.type}
                </span>

                <div style={{ marginBottom: 6 }}>
                  <span
                    style={{
                      textDecoration: "line-through",
                      color: "#b00",
                    }}
                  >
                    {c.original}
                  </span>{" "}
                  ←{" "}
                  <span style={{ color: "#080", fontWeight: 600 }}>
                    {c.revised}
                  </span>
                </div>

                <div style={{ fontSize: 14, color: "#666" }}>
                  {c.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
