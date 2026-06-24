import React, { useState } from "react";
import axios from "axios";
import { X, Loader } from "lucide-react";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Login handles username or email
        const payload = {
          username: formData.username || undefined,
          email: formData.email || undefined,
          password: formData.password,
        };
        // Fallback email value to username if it looks like email
        if (formData.username.includes("@")) {
          payload.email = formData.username;
          payload.username = undefined;
        } else {
          payload.username = formData.username;
        }

        const response = await axios.post("/api/v1/user/login", payload);
        const { user } = response.data.data;
        onAuthSuccess(user);
        onClose();
      } else {
        // Register user
        const response = await axios.post("/api/v1/user/register", {
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
        // Auto login after registration
        setIsLogin(true);
        setError("Account created. Please log in.");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Authentication failed. Please verify your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div 
        className="bg-neutral-900 border border-neutral-800 max-w-sm w-full rounded-md shadow-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-300 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-neutral-200 mb-6">
          {isLogin ? "Sign In to PDFphile" : "Create an Account"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-700 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-1">
              {isLogin ? "Username or Email" : "Username"}
            </label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder={isLogin ? "johndoe or john@example.com" : "johndoe"}
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-700 transition"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-700 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-700 transition"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 font-medium pt-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-neutral-100 text-neutral-950 font-medium py-2 rounded text-sm hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin mr-2" />
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-xs text-neutral-400 hover:text-neutral-200 transition underline"
          >
            {isLogin
              ? "Need an account? Register here"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
