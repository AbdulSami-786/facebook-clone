import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

function Navbar() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    const confirmSignOut = confirm("Are you sure you want to sign out?");
    if (confirmSignOut) {
      const auth = getAuth();
      signOut(auth).catch((error) => {
        console.error("Sign-out error:", error);
      });
    }
  };

  return (
    <nav className="bg-white/60 backdrop-blur-md shadow-md border-b border-indigo-200 px-6 sm:px-10 py-4  w-full z-50 transition-all duration-300 animate-fade-in-down">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl sm:text-3xl font-extrabold text-indigo-700 hover:text-indigo-900 transition duration-300 tracking-wide"
        >
          ASW BIRD 🐦
        </Link>

        {/* Menu */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          {/* Add Post Button */}
          <Link
            to="/addpost"
            className="bg-indigo-600 text-white px-5 py-2 sm:px-6 sm:py-3 rounded-full font-semibold text-sm sm:text-base shadow-md hover:shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 duration-300"
          >
            + Add Post
          </Link>

          {!currentUser ? (
            // Sign Up
            <Link
              to="/signup"
              className="bg-white text-indigo-700 border border-indigo-600 px-5 py-2 sm:px-6 sm:py-3 rounded-full font-semibold text-sm sm:text-base shadow-md hover:bg-indigo-50 transition-transform transform hover:scale-105 duration-300"
            >
              Sign Up
            </Link>
          ) : (
            <>
              {/* User Profile */}
              <Link
                to="/user"
                className="flex items-center space-x-2 bg-white text-indigo-700 border border-indigo-300 px-5 py-2 sm:px-6 sm:py-3 rounded-full font-semibold shadow-md hover:bg-indigo-50 transition-transform transform hover:scale-105 duration-300"
              >
                <FaUserCircle className="text-lg sm:text-xl" />
                <span className="hidden sm:inline">{currentUser.displayName || "User"}</span>
              </Link>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="flex items-center bg-red-500 text-white px-4 py-2 sm:px-5 sm:py-3 rounded-full font-semibold shadow-md hover:bg-red-600 transition-transform transform hover:scale-105 duration-300"
              >
                <FaSignOutAlt className="mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
