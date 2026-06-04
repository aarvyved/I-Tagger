"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { UserPlus } from "lucide-react";
import { motion } from "framer-motion";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/users", { name: username });
      // Log the user in automatically upon successful signup
      login(response.data.name);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed");
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
          <div className="bg-emerald-500/20 p-4 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
          <p className="text-slate-400 mt-2 text-sm">Join Image Tagger today</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              placeholder="Choose a unique username"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-3 font-semibold text-white transition-colors duration-200"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <a href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Sign in
          </a>
        </p>
      </motion.div>
    </div>
  );
}
