"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getEvent } from "@/lib/firestore";
import { Event, PermissionLevel } from "@/types";
import { CollectionTab } from "@/components/admin/CollectionTab";
import { ScheduleTab } from "@/components/admin/ScheduleTab";
import { LiveTab } from "@/components/admin/LiveTab";
import { SubmissionsTab } from "@/components/admin/SubmissionsTab";
import { AdminManagementTab } from "@/components/admin/AdminManagementTab";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Copy, Check, Shield, Users, Inbox } from "lucide-react";

export default function EventDashboard() {
    const { id } = useParams() as { id: string };
    const { user } = useAuth();
    const [event, setEvent] = useState<Event | null>(null);
    const [activeTab, setActiveTab] = useState("collection");
    const [role, setRole] = useState<PermissionLevel | "owner">("view");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (id) {
            getEvent(id).then(setEvent);
        }
    }, [id]);

    useEffect(() => {
        if (event && user) {
            if (event.ownerId === user.uid) {
                setRole("owner");
            } else {
                const admin = event.admins?.find(a => a.userId === user.uid || a.email === user.email);
                if (admin) setRole(admin.permission);
                else setRole("view");
            }
        }
    }, [event, user]);

    const handleCopyLink = () => {
        const url = `${window.location.origin}/submit/${id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!event) return (
        <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
    );

    const canManageAdmins = role === "owner" || role === "manage";
    const canEdit = role === "owner" || role === "manage" || role === "edit";

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                            {event.title}
                        </h1>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${role === 'owner' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                            role === 'manage' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                            {role}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Shield size={14} className="text-indigo-400/60" />
                        Managed by {role === "owner" ? "You" : (event.ownerEmail || "System")}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleCopyLink}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 font-medium text-sm group"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} className="group-hover:rotate-12 transition-transform" />}
                        {copied ? "Copied Link" : "Share Form"}
                    </button>
                </div>
            </div>

            <div className="bg-card border border-white/5 rounded-3xl overflow-hidden min-h-[600px] shadow-2xl">
                <div className="border-b border-white/10 bg-white/[0.02]">
                    <div className="flex overflow-x-auto scrollbar-none">
                        {[
                            { id: "collection", label: "Collection", icon: Inbox },
                            { id: "submissions", label: "Submissions", icon: Inbox },
                            { id: "schedule", label: "Schedule Builder", icon: Inbox },
                            { id: "live", label: "Live Control", icon: Inbox },
                            { id: "admins", label: "Team", icon: Users },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                                    : "border-transparent text-muted-foreground hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {activeTab === tab.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-8">
                    {activeTab === "collection" && <CollectionTab eventId={id} />}
                    {activeTab === "submissions" && <SubmissionsTab eventId={id} />}
                    {activeTab === "schedule" && <ScheduleTab eventId={id} eventConfig={event.config} />}
                    {activeTab === "live" && <LiveTab eventId={id} eventConfig={event.config} />}
                    {activeTab === "admins" && <AdminManagementTab eventId={id} currentUserEmail={user?.email || ""} />}
                </div>
            </div>
        </div>
    );
}

