import React, { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  query,
  limit,
  orderBy,
  deleteDoc,
  doc as firestoreDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { db } from "../src/firebase/firebase";
import { getAuth } from "firebase/auth";
import Swal from 'sweetalert2';

function App() {
  const [postData, setPostData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [showLikedBy, setShowLikedBy] = useState({});

  const [mediaUrl, setMediaUrl] = useState('');
  const [isVideo, setIsVideo] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUserEmail(user?.email || null);
    });

    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(60)
    );

    const unsubscribePosts = onSnapshot(q, (querySnapshot) => {
      const posts = [];
      querySnapshot.forEach((doc) => {
        posts.push({ ...doc.data(), id: doc.id });
      });
      setPostData(posts);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribePosts();
    };
  }, []);

  const handleDelete = async (postId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this post?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      await deleteDoc(firestoreDoc(db, "posts", postId));
      Swal.fire('Deleted!', 'Your post has been deleted.', 'success');
    } catch (error) {
      console.error("Error deleting post:", error);
      Swal.fire('Error!', 'Failed to delete post.', 'error');
    }
  };

  const handleLike = async (postId, likedBy = []) => {
    if (!userEmail) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'You must be logged in to like or unlike posts.',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    const postRef = firestoreDoc(db, "posts", postId);
    const hasLiked = likedBy.includes(userEmail);

    try {
      await updateDoc(postRef, {
        likes: hasLiked ? likedBy.length - 1 : likedBy.length + 1,
        [hasLiked ? "likedBy" : "likedBy"]: hasLiked
          ? arrayRemove(userEmail)
          : arrayUnion(userEmail),
      });
    } catch (err) {
      console.error("Error updating like:", err);
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: 'Something went wrong. Please try again later.',
      });
    }
  };

  const handleShowLikedBy = (postId, likedBy = []) => {
    const users = likedBy.map(user => (
      <div key={user} className="flex items-center space-x-2 p-2">
        <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center">
          {user[0].toUpperCase()}
        </div>
        <span>{user}</span>
      </div>
    ));

    setShowLikedBy((prevState) => ({
      ...prevState,
      [postId]: users,
    }));
  };

  const handlePost = async () => {
    if (!mediaUrl) {
      Swal.fire({
        icon: 'warning',
        title: 'URL Required',
        text: 'Please provide an image or video URL.',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("You must be signed in to post.");
      return;
    }

    try {
      await addDoc(collection(db, "posts"), {
        text: "New post with media!",
        imageUrl: mediaUrl,
        isVideo: isVideo,
        createdAt: new Date(),
        userEmail: user.email,
        likes: 0,
        likedBy: []  
      });
      setMediaUrl('');
      setIsVideo(false);
      alert('Post uploaded!');
    } catch (error) {
      console.error('Error uploading post:', error);
      alert('Failed to upload post');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-100 via-blue-100 to-indigo-100 p-6">
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-slow">
        {postData.length === 0 ? (
          <p>No posts available.</p>
        ) : (
          postData.map((post) => (
            <div
              key={post.id}
              className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl transition-transform duration-300 hover:scale-[1.03] hover:shadow-2xl border border-gray-100 overflow-hidden"
            >
              {/* Display Image or Video */}
              {post.isVideo ? (
                <video
                  src={post.imageUrl}
                  controls
                  className="w-full h-64 object-cover rounded-t-3xl transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <img
                  src={post.imageUrl}
                  alt={post.text || "Post Image"}
                  className="w-full h-64 object-cover rounded-t-3xl transition-transform duration-500 hover:scale-105"
                />
              )}

              <div className="p-6 space-y-4">
                <p className="text-lg text-gray-800 font-medium leading-relaxed">
                  {post.text || "No content available."}
                </p>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>👤 {post.userEmail || "Anonymous"}</span>
                  <span>🕒 {new Date(post.createdAt?.seconds * 1000).toLocaleString() || "Unknown"}</span>
                </div>

                <div className="flex justify-between items-center border-t pt-4">
                  <button
                    onClick={() => handleLike(post.id, post.likedBy)}
                    className={`px-4 py-2 rounded-full transition duration-300 font-bold shadow
                      ${post.likedBy?.includes(userEmail)
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-gray-200 text-indigo-600 hover:bg-indigo-100 hover:scale-105"}`}
                  >
                    {post.likedBy?.includes(userEmail) ? "👎 Remove Like" : "👍 Like"} {post.likes || 0}
                  </button>

                  {/* Button to show users who liked the post */}
                  <button
                    onClick={() => handleShowLikedBy(post.id, post.likedBy)}
                    className="px-4 py-2 rounded-full bg-gray-300 text-gray-700 hover:bg-gray-400"
                  >
                    Show Likes
                  </button>
                </div>

                {/* Display liked users in a modal-style */}
                {showLikedBy[post.id] && (
                  <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-xl p-6 space-y-4 max-w-md w-full">
                      <h3 className="text-xl font-bold text-gray-700">Users who liked this post:</h3>
                      <div className="space-y-2">{showLikedBy[post.id]}</div>
                      <button
                        onClick={() => setShowLikedBy((prevState) => {
                          const newState = { ...prevState };
                          delete newState[post.id]; // Remove the likedBy details for this post
                          return newState;
                        })}
                        className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition duration-200"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Centered Delete Button */}
              {userEmail === post.userEmail && (
                <div className="flex justify-center items-center pt-4 pb-6">
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="bg-red-600 text-white hover:bg-red-700 font-semibold py-2 px-6 rounded-lg transition duration-200 transform hover:scale-105"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
