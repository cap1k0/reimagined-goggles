"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function run() {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        router.replace("/login");
        return;
      }

      const userId = data.session.user.id;

      // پروفایل رو چک کن - اگه نداشت (کاربر مجیک‌لینک تازه)، بفرستش صفحه‌ی تکمیل اسم
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", userId)
        .maybeSingle();

      if (!profile) {
        // اولین ورود - یه ردیف خالی بساز (اسم از گوگل خودکار پر میشه اگه موجود باشه)
        const metadata = data.session.user.user_metadata;
        await supabase.from("profiles").insert({
          id: userId,
          email: data.session.user.email,
          name: metadata?.full_name || metadata?.name || null,
        });
      }

      if (!profile?.name && !data.session.user.user_metadata?.full_name) {
        router.replace("/complete-profile");
      } else {
        router.replace("/editor");
      }
    }
    run();
  }, [router]);

  return <p style={{ textAlign: "center", marginTop: 80 }}>در حال ورود...</p>;
}
