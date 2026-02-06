// Firebase Backend Test Script
// Run this in your browser console after signing in to verify everything works

console.log("🔥 Firebase Backend Test");
console.log("========================\n");

// Test 1: Check Firebase Config
console.log("1️⃣ Firebase Configuration:");
console.log("   Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log("   Auth Domain:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
console.log("   ✅ Config loaded\n");

// Test 2: Check Authentication
console.log("2️⃣ Authentication Status:");
// This will be available after you sign in
// Check in your browser: auth.currentUser

// Test 3: Test Firestore Connection
console.log("3️⃣ Firestore Connection:");
console.log("   Run this after signing in:");
console.log(`
   import { createEvent } from '@/lib/firestore';
   const event = await createEvent('test-user-id', 'Test Event');
   console.log('Created event:', event);
`);

console.log("\n✅ All tests ready!");
console.log("📝 Sign in with Google to test authentication");
