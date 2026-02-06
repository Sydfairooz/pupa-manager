"use client";

import { useEffect, useState } from "react";
import { getEventSubmissions, updateSubmissionStatus, addProgram } from "@/lib/firestore";
import { FormSubmission } from "@/types";
import { Loader2, Check, X, User, Clock, Tag, MessageSquare, ExternalLink, Mail, Phone, Calendar } from "lucide-react";

export function SubmissionsTab({ eventId }: { eventId: string }) {
    const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubmissions = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getEventSubmissions(eventId);
            setSubmissions(data);
        } catch (err: any) {
            console.error(err);
            if (err.message?.includes("index is currently building")) {
                setError("Building Index");
            } else {
                setError("Failed to load submissions");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, [eventId]);

    const handleApprove = async (submission: FormSubmission) => {
        try {
            // First update submission status
            await updateSubmissionStatus(submission.submissionId, "approved");

            // Then add to programs list
            await addProgram(eventId, {
                itemName: submission.itemName,
                participants: submission.participants,
                timeNeeded: submission.timeNeeded,
                category: submission.category,
                remarks: submission.remarks,
                materials: "Pending", // Default value for new program
                dressStatus: (submission.costumeStatus as any) || "Pending"
            });

            // Refresh list
            fetchSubmissions();
        } catch (error) {
            console.error(error);
            alert("Failed to approve submission.");
        }
    };

    const handleReject = async (submissionId: string) => {
        if (!confirm("Are you sure you want to reject this submission?")) return;
        try {
            await updateSubmissionStatus(submissionId, "rejected");
            fetchSubmissions();
        } catch (error) {
            console.error(error);
            alert("Failed to reject submission.");
        }
    };

    if (loading) return (
        <div className="flex flex-col h-64 items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-xs font-medium text-white/40 uppercase tracking-widest animate-pulse">Syncing Data...</p>
        </div>
    );

    if (error === "Building Index") return (
        <div className="flex flex-col items-center justify-center py-20 border border-indigo-500/10 rounded-3xl bg-indigo-500/5 space-y-6">
            <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse"></div>
                <div className="bg-card border border-white/10 p-4 rounded-2xl relative">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                </div>
            </div>
            <div className="text-center space-y-2">
                <h4 className="text-xl font-bold text-white">Configuring Engine</h4>
                <p className="text-sm text-muted-foreground max-w-sm">
                    Firestore is currently optimizing your database for fast searching.
                    This setup happens once and usually takes 2-5 minutes.
                </p>
                <button
                    onClick={fetchSubmissions}
                    className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all"
                >
                    Check Status
                </button>
            </div>
        </div>
    );

    const pendingSubmissions = submissions.filter(s => s.status === "pending");
    const otherSubmissions = submissions.filter(s => s.status !== "pending");

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Public Submissions</h3>
                    <p className="text-sm text-muted-foreground mt-1">Review and approve items submitted via the public link.</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    <span className="text-xs font-semibold text-indigo-400">{pendingSubmissions.length} Pending Actions</span>
                </div>
            </div>

            {pendingSubmissions.length === 0 && otherSubmissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
                    <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                    <h4 className="text-lg font-medium">No submissions yet</h4>
                    <p className="text-sm text-muted-foreground text-center max-w-xs mt-2">
                        Share your public form link with participants to start collecting program details.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Pending Submissions Section */}
                    {pendingSubmissions.map((s) => (
                        <div key={s.submissionId} className="group relative bg-card border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-300">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                {s.category}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(s.submittedAt.toMillis()).toLocaleString()}
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-bold group-hover:text-indigo-300 transition-colors">{s.itemName}</h4>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprove(s)}
                                            className="p-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                            title="Approve & Add to List"
                                        >
                                            <Check size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleReject(s.submissionId)}
                                            className="p-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                            title="Reject"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-white/5 text-muted-foreground">
                                                <User size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-tighter text-white/40 font-bold">Participants</p>
                                                <p className="text-sm text-white/80 line-clamp-2 leading-relaxed">
                                                    {s.participants.join(", ")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-white/5 text-muted-foreground">
                                                <Clock size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-tighter text-white/40 font-bold">Duration</p>
                                                <p className="text-sm text-white/80">{s.timeNeeded} minutes</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {(s.contactEmail || s.contactPhone) && (
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-white/5 text-muted-foreground">
                                                    <Mail size={16} />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-[10px] uppercase tracking-tighter text-white/40 font-bold">Contact Info</p>
                                                    <p className="text-sm text-white/80 truncate">{s.contactEmail || "N/A"}</p>
                                                    {s.contactPhone && <p className="text-xs text-white/50">{s.contactPhone}</p>}
                                                </div>
                                            </div>
                                        )}
                                        {s.remarks && (
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-white/5 text-muted-foreground">
                                                    <MessageSquare size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-tighter text-white/40 font-bold">Remarks</p>
                                                    <p className="text-sm text-white/60 italic leading-snug">"{s.remarks}"</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Recently Processed */}
            {otherSubmissions.length > 0 && (
                <div className="space-y-4 pt-8 border-t border-white/5">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-white/30">Action History</h4>
                    <div className="space-y-2">
                        {otherSubmissions.map((s) => (
                            <div key={s.submissionId} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${s.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        {s.status === 'approved' ? <Check size={16} /> : <X size={16} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{s.itemName}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{s.status}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                    {new Date(s.submittedAt.toMillis()).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
