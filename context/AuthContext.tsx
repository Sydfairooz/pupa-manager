"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const [isSigningIn, setIsSigningIn] = useState(false);

    const signInWithGoogle = async () => {
        if (isSigningIn || user) return;
        setIsSigningIn(true);
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error: any) {
            if (error.code === "auth/cancelled-popup-request") {
                console.warn("Sign-in popup was cancelled because another one was pending.");
            } else if (error.code === "auth/popup-closed-by-user") {
                console.log("User closed the sign-in popup.");
            } else {
                console.error("Error signing in with Google", error);
            }
        } finally {
            setIsSigningIn(false);
        }
    };

    const signOut = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
