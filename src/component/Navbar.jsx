import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function Navbar() {
  // Get the latest signed-up user from the Redux store
  const sign = useSelector((state) => state.Sign.sign);
  const latestUser = sign.length > 0 ? sign[sign.length - 1].title : null;

  return (
    <nav className="bg-indigo-600 text-white px-6 py-4 shadow-md flex justify-between items-center">
      <Link to={'/'}>
      <div className="text-lg font-bold">MyApp</div>
      </Link>

      <div className="flex items-center space-x-4">
        <Link
          to="/addpost"
          className="bg-white text-indigo-600 px-4 py-2 rounded-full font-medium hover:bg-indigo-100 transition"
        >
          Add Post
        </Link>

        <Link
          to="/signup"
          className="bg-white text-indigo-600 px-4 py-2 rounded-full font-medium hover:bg-indigo-100 transition"
        >
          Sign Up
        </Link>

        {latestUser ? (
          <span className="bg-white text-indigo-600 px-3 py-1 rounded-full text-sm">
            Signed in as: <strong>{latestUser}</strong>
          </span>
        ) : (
          <span className="text-white/80 italic text-sm">Not signed in</span>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
