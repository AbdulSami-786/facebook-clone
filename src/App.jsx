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
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUserEmail(user?.email || null);
    });

    const q = query(
      collection(db, "posts"),
      orderBy("likes", "desc"),
      limit(60)
    );

    const unsubscribePosts = onSnapshot(q, (querySnapshot) => {
      const posts = [];
      querySnapshot.forEach((doc) => {
        posts.push({ ...doc.data(), id: doc.id });
      });
      setPostData(posts);
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

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-100 via-blue-100 to-indigo-100 p-6">

      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-slow">
        {postData.map((post) => (
          <div
            key={post.id}
            className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl transition-transform duration-300 hover:scale-[1.03] hover:shadow-2xl border border-gray-100 overflow-hidden"
          >
            {post.imageUrl && (
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
                <span>🕒 {post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleString() : "Unknown"}</span>
              </div>

              <div className="flex justify-between items-center border-t pt-4">
                <button
                  onClick={() => handleLike(post.id, post.likedBy)}
                  className={`px-4 py-2 rounded-full transition duration-300 font-bold shadow
                    ${post.likedBy?.includes(userEmail)
                      ? "bg-gray-200 text-indigo-700 hover:bg-gray-300"
                      : "bg-indigo-500 text-white hover:bg-indigo-600 hover:scale-105"}`}
                >
                  {post.likedBy?.includes(userEmail) ? "👎 Remove Like" : "👍 Like"} {post.likes || 0}
                </button>
              </div>

              {post.likedBy?.length > 0 && (
                <div className="text-xs text-gray-500 pt-1">
                  ❤️ Liked by: <em>{post.likedBy.join(", ")}</em>
                </div>
              )}

              {userEmail === post.userEmail && (
                <div className="text-right pt-3">
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="bg-red-100 text-red-600 hover:bg-red-200 font-semibold px-4 py-2 rounded-full transition-transform transform hover:scale-105"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
