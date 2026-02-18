import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../Css/Cards/Auth/SignIn.css"

export default function SignIn() {
    const nav = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const resp = await fetch("http://localhost:8000/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const res = await resp.json();
            if (!resp.ok) {
                setError(res.message || "Invalid credentials. Please try again.");
                return;
            }
            localStorage.setItem("token", res.token);
            localStorage.setItem("user", JSON.stringify(res.user));
            nav("/userhome");
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
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-sub">Sign in to continue your practice.</p>

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
                        <label className="auth-label">Password</label>
                        <input
                            type="password"
                            className="auth-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" className="auth-btn-primary" disabled={loading}>
                        {loading ? <span className="auth-spinner" /> : "Sign In →"}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account?{" "}
                    <button type="button" onClick={() => nav("/signup")}>
                        Sign Up
                    </button>
                </div>

            </div>
        </div>
    );
}