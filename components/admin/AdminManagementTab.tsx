"use client";

import { useEffect, useState } from "react";
import { addEventAdmin, removeEventAdmin, updateAdminPermission, getEvent } from "@/lib/firestore";
import { Event, AdminPermission, PermissionLevel } from "@/types";
import { Loader2, UserPlus, Shield, Trash2, Mail, Clock, ShieldCheck, ShieldAlert, Info } from "lucide-react";
import { Timestamp } from "@/lib/firestore";

export function AdminManagementTab({ eventId, currentUserEmail }: { eventId: string, currentUserEmail: string }) {
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ email: "", displayName: "", permission: "view" as PermissionLevel });
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        const ev = await getEvent(eventId);
        setEvent(ev);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [eventId]);

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAdmin.email || !newAdmin.displayName) return;

        setActionLoading("adding");
        try {
            const admin: AdminPermission = {
                userId: Math.random().toString(36).substring(7), // In real app, this should be linked to an actual auth user ID
                email: newAdmin.email,
                displayName: newAdmin.displayName,
                permission: newAdmin.permission,
                addedAt: Timestamp.now()
            };
            await addEventAdmin(eventId, admin);
            setIsAdding(false);
            setNewAdmin({ email: "", displayName: "", permission: "view" });
            fetchData();
        } catch (error) {
            console.error(error);
            alert("Failed to add admin.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemove = async (userId: string) => {
        if (!confirm("Remove this admin?")) return;
        setActionLoading(userId);
        try {
            await removeEventAdmin(eventId, userId);
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdatePermission = async (userId: string, permission: PermissionLevel) => {
        setActionLoading(`${userId}-perm`);
        try {
            await updateAdminPermission(eventId, userId, permission);
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    };

    const [copied, setCopied] = useState(false);

    const handleCopyViewLink = () => {
        const url = `${window.location.origin}/view/${eventId}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
    );

    const getPermissionIcon = (level: PermissionLevel) => {
        switch (level) {
            case "manage": return <ShieldCheck className="text-indigo-400" size={16} />;
            case "edit": return <ShieldAlert className="text-emerald-400" size={16} />;
            case "view": return <Info className="text-amber-400" size={16} />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold">Team & Access</h3>
                    <p className="text-sm text-muted-foreground mt-1">Manage admins and their permission levels for this event.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleCopyViewLink}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium border ${copied ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`}
                    >
                        {copied ? <ShieldCheck size={18} /> : <Shield size={18} />}
                        {copied ? "Link Copied!" : "Copy View Link"}
                    </button>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 font-medium"
                    >
                        <UserPlus size={18} />
                        Add Editor/Manager
                    </button>
                </div>
            </div>

            {isAdding && (
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4 animate-in slide-in-from-top-4 duration-300">
                    <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 ml-1">Display Name</label>
                            <input
                                required
                                placeholder="e.g. Rahul Sharma"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500/50 transition-colors"
                                value={newAdmin.displayName}
                                onChange={e => setNewAdmin({ ...newAdmin, displayName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 ml-1">Email Address</label>
                            <input
                                required
                                type="email"
                                placeholder="email@example.com"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500/50 transition-colors"
                                value={newAdmin.email}
                                onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 ml-1">Permission Level</label>
                            <select
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500/50 transition-colors appearance-none"
                                value={newAdmin.permission}
                                onChange={e => setNewAdmin({ ...newAdmin, permission: e.target.value as PermissionLevel })}
                            >
                                <option value="edit">Editor</option>
                                <option value="manage">Manager</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button
                                type="submit"
                                disabled={actionLoading === "adding"}
                                className="flex-1 h-[46px] bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all flex items-center justify-center"
                            >
                                {actionLoading === "adding" ? <Loader2 size={18} className="animate-spin" /> : "Invite"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="h-[46px] px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                            >
                                <Trash2 size={18} className="text-rose-500/70" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {/* Owner Card (Always first) */}
                <div className="flex items-center justify-between p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
                            {event?.ownerEmail?.[0].toUpperCase() || "O"}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white/90">Event Owner</h4>
                                <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-[10px] font-bold uppercase tracking-tighter shadow-sm">Creator</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{event?.ownerEmail}</p>
                        </div>
                    </div>
                </div>

                {/* Admins List */}
                {event?.admins && event.admins.length > 0 ? (
                    event.admins.map((admin) => (
                        <div key={admin.userId} className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-card border border-white/10 rounded-2xl hover:border-white/20 transition-all">
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/60 font-medium text-lg border border-white/10 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-all duration-300">
                                    {admin.displayName[0].toUpperCase()}
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="font-bold text-white/90">{admin.displayName}</h4>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Mail size={12} />
                                            {admin.email}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
                                            {getPermissionIcon(admin.permission)}
                                            <span className="capitalize">{admin.permission}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                                <div className="hidden lg:flex flex-col items-end mr-4 text-right">
                                    <span className="text-[10px] uppercase font-bold text-white/20">Added on</span>
                                    <span className="text-xs text-muted-foreground">
                                        {admin.addedAt ? new Date(admin.addedAt.toMillis()).toLocaleDateString() : "Just now"}
                                    </span>
                                </div>

                                <select
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-indigo-500/50 transition-colors"
                                    value={admin.permission}
                                    onChange={e => handleUpdatePermission(admin.userId, e.target.value as PermissionLevel)}
                                    disabled={actionLoading === `${admin.userId}-perm`}
                                >
                                    <option value="edit">Edit Mode</option>
                                    <option value="manage">Manage Mode</option>
                                </select>

                                <button
                                    onClick={() => handleRemove(admin.userId)}
                                    disabled={actionLoading === admin.userId}
                                    className="p-2 text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                >
                                    {actionLoading === admin.userId ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    !isAdding && (
                        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                            <Shield className="w-10 h-10 text-white/10 mb-3" />
                            <p className="text-sm text-muted-foreground">No additional team members added yet.</p>
                        </div>
                    )
                )}
            </div>

            <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                    <Shield size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-indigo-300">About Permissions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-3">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-tighter">View Only</span>
                            <p className="text-xs text-muted-foreground leading-relaxed">Can only see dashboard, programs and schedule. Cannot make any changes.</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-tighter">Editor</span>
                            <p className="text-xs text-muted-foreground leading-relaxed">Can add/edit/delete programs, manage schedules, and control live status.</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-tighter">Manager</span>
                            <p className="text-xs text-muted-foreground leading-relaxed">Full access including event settings and adding/removing other team members.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
