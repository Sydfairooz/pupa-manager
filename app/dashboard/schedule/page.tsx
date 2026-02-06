"use client";

import { useAuth } from "@/context/AuthContext";
import { Calendar, Clock, MapPin } from "lucide-react";

export default function SchedulePage() {
    const { user } = useAuth();

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        Schedule Overview
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        View all your upcoming events and programs
                    </p>
                </div>
            </div>

            {/* Coming Soon Card */}
            <div className="glass-panel rounded-2xl p-12 text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                    <Calendar className="w-10 h-10 text-indigo-400" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">
                        Schedule View Coming Soon
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        This feature will show you a comprehensive calendar view of all your events and programs across all your managed events.
                    </p>
                </div>

                {/* Feature Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <Calendar className="w-6 h-6 text-indigo-400 mb-2 mx-auto" />
                        <div className="text-sm font-medium text-white">Calendar View</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            See all events at a glance
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <Clock className="w-6 h-6 text-emerald-400 mb-2 mx-auto" />
                        <div className="text-sm font-medium text-white">Timeline</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Track program schedules
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <MapPin className="w-6 h-6 text-purple-400 mb-2 mx-auto" />
                        <div className="text-sm font-medium text-white">Locations</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Manage event venues
                        </div>
                    </div>
                </div>

                {/* Temporary Redirect */}
                <div className="pt-6">
                    <a
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
                    >
                        Back to Dashboard
                    </a>
                </div>
            </div>
        </div>
    );
}
