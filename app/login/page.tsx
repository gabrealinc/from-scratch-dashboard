"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Unable to sign in.");
      setLoading(false);
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next");
    router.replace(next || "/");
    router.refresh();
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="brand-mark">FS</div>
        <p className="eyebrow">Private reporting</p>
        <h1>From Scratch</h1>
        <p className="login-copy">Sales, royalties, reach, and the story behind every copy.</p>
        <form onSubmit={submit}>
          <label htmlFor="password">Shared password</label>
          <div className="input-wrap">
            <LockKeyhole size={17} />
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button disabled={loading || !password}>{loading ? "Opening…" : "Open dashboard"}<ArrowRight size={17} /></button>
        </form>
        <p className="confidential">Confidential · Gabby + Ryan</p>
      </section>
    </main>
  );
}
