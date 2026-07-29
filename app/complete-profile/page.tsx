"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function CompleteProfilePage() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) {
      router.replace("/login");
      return;
    }

    const { error } = await supabase.from("profiles").update({ name }).eq("id", userId);
    if (error) {
      setError("مشکلی پیش اومد، دوباره امتحان کن.");
      return;
    }
    router.replace("/editor");
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", fontFamily: "'Space Grotesk', sans-serif" }}>
      <h1>اسمت چیه؟</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          required
          placeholder="نام و نام خانوادگی"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <button type="submit" style={{ width: "100%", padding: 10 }}>
          ادامه
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
