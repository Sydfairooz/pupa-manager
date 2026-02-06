"use client";

import { useAuth } from "@/context/AuthContext";
import { User, Mail, Shield, Calendar, LogOut } from "lucide-react";
import { format } from "date-fns";

export default function ProfilePage() {
    const { user, signOut } = useAuth();

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        Profile
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your account settings and preferences
                    </p>
                </div>
            </div>

            {/* Profile Card */}
            <div className="glass-panel rounded-2xl p-8 space-y-8">
                {/* User Info Section */}
                <div className="flex items-start gap-6">
                    <div className="relative">
                        <img
                            src={user.photoURL || ""}
                            alt={user.displayName || "User"}
                            className="w-24 h-24 rounded-full ring-4 ring-indigo-500/30"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-background"></div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                {user.displayName || "User"}
                            </h2>
                            <p className="text-muted-foreground">
                                {user.email}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <Shield className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">Verified Account</span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10"></div>

                {/* Account Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Account Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <User className="w-5 h-5 text-indigo-400" />
                                <span className="text-sm text-muted-foreground">Display Name</span>
                            </div>
                            <div className="text-white font-medium">
                                {user.displayName || "Not set"}
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <Mail className="w-5 h-5 text-emerald-400" />
                                <span className="text-sm text-muted-foreground">Email Address</span>
                            </div>
                            <div className="text-white font-medium truncate">
                                {user.email}
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <Shield className="w-5 h-5 text-purple-400" />
                                <span className="text-sm text-muted-foreground">User ID</span>
                            </div>
                            <div className="text-white font-medium font-mono text-xs truncate">
                                {user.uid}
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <Calendar className="w-5 h-5 text-cyan-400" />
                                <span className="text-sm text-muted-foreground">Account Created</span>
                            </div>
                            <div className="text-white font-medium">
                                {user.metadata?.creationTime
                                    ? format(new Date(user.metadata.creationTime), "MMM dd, yyyy")
                                    : "Unknown"
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10"></div>

                {/* Authentication Provider */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Authentication</h3>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                alt="Google"
                                className="w-6 h-6"
                            />
                            <div>
                                <div className="text-white font-medium">Google</div>
                                <div className="text-xs text-muted-foreground">
                                    Signed in with Google
                                </div>
                            </div>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                            Active
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10"></div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Last sign in: {user.metadata?.lastSignInTime
                            ? format(new Date(user.metadata.lastSignInTime), "MMM dd, yyyy 'at' h:mm a")
                            : "Unknown"
                        }
                    </div>

                    <button
                        onClick={signOut}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-medium transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Additional Info */}
            <div className="glass-panel rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">Privacy & Security</h3>
                        <p className="text-sm text-muted-foreground">
                            Your account is secured with Google Authentication. We never store your password,
                            and all data is encrypted in transit and at rest.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
