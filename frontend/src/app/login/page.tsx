"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LogIn } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/login", { name: username });
      login(response.data.name);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-white/5 p-8 backdrop-blur-xl border border-white/10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-500/20 p-4 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 mt-2 text-sm">Sign in to continue to Image Tagger</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Enter your username"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-3 font-semibold text-white transition-colors duration-200"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign up
          </a>
        </p>
      </motion.div>
    </div>
  );
}
