"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (title: string) => Promise<void>;
}

export function CreateEventModal({ isOpen, onClose, onCreate }: CreateEventModalProps) {
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        await onCreate(title);
        setLoading(false);
        setTitle("");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden scale-100 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                    <h3 className="font-semibold text-lg">Create New Event</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Event Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Annual Arts Showcase 2026"
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading || !title.trim()}
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
