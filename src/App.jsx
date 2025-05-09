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
  arrayUnion
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
        text: 'You must be logged in to like posts.',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    if (likedBy.includes(userEmail)) return;

    try {
      const postRef = firestoreDoc(db, "posts", postId);
      await updateDoc(postRef, {
        likes: likedBy.length + 1,
        likedBy: arrayUnion(userEmail),
      });
    } catch (err) {
      console.error("Error liking post:", err);
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: 'Something went wrong. Please try again later.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 to-blue-100 p-8">
      <h1 className="text-4xl font-bold text-indigo-800 mb-8 text-center">Latest Posts</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {postData.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6 w-full transform transition duration-500 hover:scale-105 hover:shadow-2xl"
          >
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt={post.text || "Post Image"}
                className="w-full h-72 object-cover rounded-t-3xl"
              />
            )}

            <div className="p-6 space-y-4">
              <p className="text-lg text-gray-800">{post.text || "No content available."}</p>

              <div className="flex justify-between text-sm text-gray-600">
                <div>
                  <span className="font-semibold text-indigo-600">{post.userEmail || "Unknown"}</span>
                </div>
                <div className="text-gray-400">
                  {post.createdAt?.seconds
                    ? new Date(post.createdAt.seconds * 1000).toLocaleString()
                    : "Unknown date"}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <button
                  onClick={() => handleLike(post.id, post.likedBy)}
                  disabled={post.likedBy?.includes(userEmail)}
                  className={`px-4 py-2 rounded-full transition duration-300 font-semibold
                    ${post.likedBy?.includes(userEmail)
                      ? "bg-gray-300 text-gray-700"
                      : "bg-blue-500 text-white hover:bg-blue-600"}`}
                >
                  👍 Like {post.likes || 0}
                </button>
              </div>

              {post.likedBy?.length > 0 && (
                <div className="text-sm text-gray-500 pt-2">
                  <strong>Liked by:</strong> {post.likedBy.join(", ")}
                </div>
              )}

              {userEmail === post.userEmail && (
                <div className="text-right pt-2">
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-red-600 bg-red-100 hover:bg-red-200 px-4 py-2 rounded-full transition ease-in-out duration-300 transform hover:scale-105"
                  >
                    Delete
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
