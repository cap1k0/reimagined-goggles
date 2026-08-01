import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      }}
    >
      <Link href="/login" style={{ color: "#fff", fontSize: 20, textDecoration: "underline" }}>
        Start →
      </Link>
    </main>
  );
}
