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
    let confor = confirm("YOU WANT TO SIGNOUT")
    if(confor){

      const auth = getAuth();
      signOut(auth).catch((error) => {
        console.error("Sign-out error:", error);
      });
    }
    else{
      
    }
  };

  return (
    <nav className="bg-indigo-700 text-white px-8 py-4 shadow-lg flex justify-between items-center rounded-b-xl transition-all ease-in-out duration-300">
      {/* Logo */}
      <Link to="/" className="text-2xl font-bold text-white hover:text-indigo-300">
        MyApp
      </Link>

      <div className="flex items-center space-x-6 w-full justify-end">
        {/* Add Post Button */}
        <Link
          to="/addpost"
          className="bg-white text-indigo-700 px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-transform transform hover:scale-105 duration-300 w-32 text-center"
        >
          Add Post
        </Link>

        {/* Conditional Links based on User Authentication */}
        {!currentUser ? (
          <>
          
            {/* Signup Link */}
            <Link
              to="/signup"
              className="bg-indigo-600 text-white px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-transform transform hover:scale-105 duration-300 w-32 text-center"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
            {/* User Profile Link */}
            <Link
              to="/user"
              className="flex items-center space-x-2 bg-white text-indigo-700 px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-transform transform hover:scale-105 duration-300 w-32 text-center"
            >
              <FaUserCircle className="text-xl" />
              <span className="text-sm">{currentUser.displayName || "User"}</span>
            </Link>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="bg-red-600 text-white px-4 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-transform transform hover:scale-105 duration-300 w-28 text-center"
            >
              <FaSignOutAlt className="inline-block mr-2" />
              Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
