"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, LayoutDashboard, Calendar, Settings, User as UserIcon, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/");
        }
    }, [user, loading, router]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background text-indigo-500">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
        </div>
    );

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex w-64 flex-col border-r border-white/10 bg-card/50 backdrop-blur-xl h-screen sticky top-0">
                <div className="p-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        Pupa
                    </h2>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <NavItem href="/dashboard" icon={<LayoutDashboard />} label="Dashboard" active={pathname === "/dashboard"} />
                    <NavItem href="/dashboard/schedule" icon={<Calendar />} label="Schedule" active={pathname.includes("/schedule")} />
                    <div className="pt-4 pb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Settings
                    </div>
                    <NavItem href="/dashboard/profile" icon={<UserIcon />} label="Profile" active={pathname === "/dashboard/profile"} />
                    <SettingsItem onClick={signOut} icon={<LogOut />} label="Sign Out" />
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <img src={user.photoURL || ""} alt="User" className="w-8 h-8 rounded-full ring-2 ring-indigo-500/50" />
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate">{user.displayName}</span>
                            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-card/80 backdrop-blur-md sticky top-0 z-50">
                    <span className="font-bold text-lg">Pupa Manager</span>
                    <button onClick={signOut} className="p-2 text-muted-foreground hover:text-white">
                        <LogOut size={20} />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    {children}
                </main>
            </div>

            {/* Right Pane - Desktop Stats (Conditional) */}
            <aside className="hidden xl:flex w-80 flex-col border-l border-white/10 bg-card/30 backdrop-blur-sm h-screen sticky top-0 p-6 space-y-6">
                <h3 className="font-semibold text-lg text-white/80">Quick Stats</h3>

                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                    <div className="text-sm text-indigo-300 mb-1">Total Events</div>
                    <div className="text-3xl font-bold">0</div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                    <div className="text-sm text-emerald-300 mb-1">Active Programs</div>
                    <div className="text-3xl font-bold">0</div>
                </div>

                <div className="mt-auto p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-xs text-muted-foreground mb-2">System Status</div>
                    <div className="flex items-center gap-2 text-sm text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Operational
                    </div>
                </div>
            </aside>
        </div>
    );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${active
                    ? "bg-indigo-600/20 text-indigo-300 shadow-[0_0_20px_-5px_rgba(79,70,229,0.3)] border border-indigo-500/20"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}
        >
            <span className={active ? "text-indigo-400" : "text-muted-foreground group-hover:text-white transition-colors"}>
                {icon}
            </span>
            <span className="font-medium">{label}</span>
        </Link>
    );
}

function SettingsItem({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-red-400 transition-colors group"
        >
            <span className="group-hover:text-red-400 transition-colors">{icon}</span>
            <span className="font-medium">{label}</span>
        </button>
    );
}
