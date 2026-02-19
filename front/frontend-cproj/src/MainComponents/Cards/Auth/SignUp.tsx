import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../Css/Cards/Auth/SignUp.css"

export default function SignUp() {
    const nav = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const resp = await fetch("https://dsaanalysis-backend.onrender.com/users/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });
            const res = await resp.json();
            if (!resp.ok) {
                setError(res.message || "Registration failed. Please try again.");
                return;
            }
            localStorage.setItem("token", res.token);
            localStorage.setItem("user", JSON.stringify(res.user));
            nav("/userhome");
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <div className="auth-brand">⚡</div>
                <h1 className="auth-title">Create account</h1>
                <p className="auth-sub">Start your spaced-repetition journey.</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label className="auth-label">Username</label>
                        <input
                            type="text"
                            className="auth-input"
                            placeholder="your_username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">Email</label>
                        <input
                            type="email"
                            className="auth-input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">Password</label>
                        <input
                            type="password"
                            className="auth-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" className="auth-btn-primary" disabled={loading}>
                        {loading ? <span className="auth-spinner" /> : "Create Account →"}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?{" "}
                    <button type="button" onClick={() => nav("/signin")}>
                        Sign In
                    </button>
                </div>

            </div>
        </div>
    );
}