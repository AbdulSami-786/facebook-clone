import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import app from '../firebase/firebase';

const User = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    const auth = getAuth(app);
    signOut(auth)
      .then(() => {
        console.log("User signed out");
      })
      .catch((error) => {
        console.error("Sign-out error:", error);
      });
  };

  const getEmailInitial = (email) => {
    if (!email) return '?';
    return email[0].toUpperCase();
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700">No user is signed in.</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full text-center">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt="User"
            className="w-24 h-24 rounded-full mx-auto mb-4 shadow-md object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center bg-indigo-500 text-white text-3xl font-bold shadow-md">
            {getEmailInitial(user.email)}
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {user.displayName || "Anonymous User"}
        </h2>
        <p className="text-sm text-gray-600 mb-1"><strong>Email:</strong> {user.email}</p>
        <p className="text-sm text-gray-600 mb-1"><strong>Email Verified:</strong> {user.emailVerified ? "Yes" : "No"}</p>
        <p className="text-sm text-gray-600 mb-4"><strong>UID:</strong> {user.uid}</p>

        <button
          onClick={handleSignOut}
          className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition duration-200"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default User;
