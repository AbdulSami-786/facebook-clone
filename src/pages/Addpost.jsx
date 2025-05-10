import React, { useState } from 'react';
import { storage, db } from '../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FaTrashAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';

function AddPost() {
  const [text, setText] = useState('');
  const [media, setMedia] = useState(null);
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [mediaType, setMediaType] = useState('image'); // 'image' or 'video'
  const [loading, setLoading] = useState(false);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      setMediaUrlInput(''); // Clear the URL input
      const fileType = file.type.split('/')[0];
      setMediaType(fileType); // Set media type based on file (image or video)
    }
  };

  const handleMediaUrlChange = (e) => {
    const url = e.target.value;
    setMediaUrlInput(url);
    setMedia(null); // Clear the file input if URL is provided
    const urlExtension = url.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const videoExtensions = ['mp4', 'webm', 'ogg'];

    // Check if the URL is an image or a video
    if (imageExtensions.includes(urlExtension)) {
      setMediaType('image');
    } else if (videoExtensions.includes(urlExtension)) {
      setMediaType('video');
    } else {
      setMediaType(''); // Invalid URL extension
    }
  };

  const handlePost = async () => {
    // Ensure there is either text or media
    if (!text && !media && !mediaUrlInput) {
      Swal.fire('Error', 'Please provide text or media.', 'error');
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Swal.fire('Error', 'You must be signed in to post.', 'error');
      return;
    }

    setLoading(true); // Set loading state while posting
    try {
      let mediaUrl = '';

      // Upload media to Firebase Storage if it's an image or video file
      if (media) {
        const mediaRef = ref(storage, `posts/${Date.now()}_${media.name}`);
        await uploadBytes(mediaRef, media);
        mediaUrl = await getDownloadURL(mediaRef); // Get the URL after upload
      } else if (mediaUrlInput) {
        mediaUrl = mediaUrlInput; // Use the URL provided by the user
      }

      // Add the post to Firestore
      await addDoc(collection(db, 'posts'), {
        text,
        mediaUrl,
        mediaType,
        createdAt: serverTimestamp(),
        userEmail: user.email,
        likes: 0,
        likedBy: [],
      });

      // Clear the form after posting
      setText('');
      setMedia(null);
      setMediaUrlInput('');
      setMediaType('image');
      Swal.fire('Success', 'Post uploaded!', 'success');
    } catch (error) {
      console.error('Error uploading post:', error);
      Swal.fire('Error', 'Failed to upload post.', 'error');
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white shadow-lg rounded-lg p-6">
      {/* Text input for the post */}
      <textarea
        className="w-full h-28 p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="What's on your mind?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* Preview media (image or video) if uploaded */}
      {media && (
        <div className="mt-4 relative">
          {mediaType === 'image' ? (
            <img
              src={URL.createObjectURL(media)}
              alt="preview"
              className="w-full max-h-64 object-cover rounded"
            />
          ) : (
            <video
              controls
              className="w-full max-h-64 object-cover rounded"
            >
              <source src={URL.createObjectURL(media)} type={media.type} />
              Your browser does not support the video tag.
            </video>
          )}
          <button
            onClick={() => setMedia(null)} // Remove the selected media
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
          >
            <FaTrashAlt />
          </button>
        </div>
      )}

      {/* Preview media (image or video) if URL is provided */}
      {!media && mediaUrlInput && (
        <div className="mt-4 relative">
          {mediaType === 'image' ? (
            <img
              src={mediaUrlInput}
              alt="URL Preview"
              className="w-full max-h-64 object-cover rounded"
              onError={() => Swal.fire('Error', 'Invalid image URL', 'error')}
            />
          ) : mediaType === 'video' ? (
            <video
              controls
              className="w-full max-h-64 object-cover rounded"
            >
              <source src={mediaUrlInput} type={`video/${mediaUrlInput.split('.').pop()}`} />
              Your browser does not support the video tag.
            </video>
          ) : null}
          <button
            onClick={() => setMediaUrlInput('')} // Clear the media URL
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
          >
            <FaTrashAlt />
          </button>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {/* File input for uploading media (image/video) */}
        <label className="block text-indigo-600 cursor-pointer">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaChange}
            className="hidden"
          />
          📷🎥 Upload Image/Video
        </label>

        {/* Input for pasting an image/video URL */}
        <input
          type="text"
          placeholder="Or paste image/video URL"
          value={mediaUrlInput}
          onChange={handleMediaUrlChange}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Post button */}
      <div className="mt-6 text-right">
        <button
          onClick={handlePost}
          className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
}

export default AddPost;
