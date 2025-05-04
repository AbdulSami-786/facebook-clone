import React, { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  query,
  limit,
  orderBy
} from "firebase/firestore";
import { db } from "../src/firebase/firebase"; // Make sure this path is correct

function App() {
  const [postData, setPostData] = useState([]);

  useEffect(() => {
    const getPosts = async () => {
      const q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"), // Fixed: "desc" instead of "text"
        limit(60)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const posts = [];
        querySnapshot.forEach((doc) => {
          posts.push({ ...doc.data(), id: doc.id });
        });
        setPostData(posts);
      });

      return () => unsubscribe(); // Cleanup listener on unmount
    };

    getPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Latest Posts</h1>
      {postData.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-2xl shadow-md overflow-hidden mb-6 w-full max-w-md"
        >
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title || "Post Image"}
              className="w-full h-60 object-cover"
            />
          )}
          <div className="p-4">
      
            <p className="text-gray-600 mt-2">
              {post.text || "No content available."}
            </p>
            <div className="text-sm text-gray-400 mt-4">
              {post.createdAt?.seconds
                ? new Date(post.createdAt.seconds * 1000).toLocaleString()
                : "Unknown date"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
