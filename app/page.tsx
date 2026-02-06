"use client";

import { useAuth } from "@/context/AuthContext";
import { MoveRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
    const { user, loading, signInWithGoogle } = useAuth();

    return (
        <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden bg-background">
            {/* Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/40 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-900/30 rounded-full blur-[128px] pointer-events-none" />

            <div className="z-10 flex flex-col items-center text-center space-y-8 p-4">
                {/* Logo / Title */}
                <div className="space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm mb-4 ring-1 ring-white/20 shadow-2xl">
                        <Sparkles className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-white via-white/90 to-white/60 bg-clip-text text-transparent glow-text">
                        Pupa Manager
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
                        The comprehensive arts program management suite. <br className="hidden md:block" />
                        Intelligent scheduling, live program tracking, and seamless collaboration.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-4 min-w-[200px] pt-8">
                    {loading ? (
                        <div className="h-12 w-full bg-white/5 animate-pulse rounded-lg border border-white/10" />
                    ) : user ? (
                        <Link
                            href="/dashboard"
                            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg bg-indigo-600 px-8 font-medium text-white transition-all duration-300 hover:bg-indigo-500 hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(99,102,241,0.5)]"
                        >
                            <span className="mr-2">Enter Dashboard</span>
                            <MoveRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    ) : (
                        <button
                            onClick={() => signInWithGoogle()}
                            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg bg-white px-8 font-medium text-black transition-all duration-300 hover:bg-gray-100 hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(255,255,255,0.3)]"
                        >
                            <img
                                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                alt="Google"
                                className="w-5 h-5 mr-3"
                            />
                            Sign in with Google
                        </button>
                    )}
                </div>

                <div className="absolute bottom-8 text-sm text-white/20 font-light">
                    Built for excellence.
                </div>
            </div>
        </main>
    );
}
