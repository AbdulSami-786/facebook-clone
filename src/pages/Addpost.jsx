import React, { useState } from 'react';
import { storage, db } from '../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

function AddPost() {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!text && !image && !imageUrlInput) return;

    setLoading(true);
    try {
      let imageUrl = '';

      if (image) {
        const imageRef = ref(storage, `posts/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      } else if (imageUrlInput) {
        imageUrl = imageUrlInput;
      }

      await addDoc(collection(db, 'posts'), {
        text,
        imageUrl,
        createdAt: Timestamp.now(),
      });

      setText('');
      setImage(null);
      setImageUrlInput('');
      alert('Post uploaded!');
    } catch (error) {
      console.error('Error uploading post:', error);
      alert('Failed to upload post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white shadow-lg rounded-lg p-6">
      <textarea
        className="w-full h-28 p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="What's on your mind?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* Image preview from file */}
      {image && (
        <div className="mt-4">
          <img
            src={URL.createObjectURL(image)}
            alt="preview"
            className="w-full max-h-64 object-cover rounded"
          />
        </div>
      )}

      {/* Image preview from URL */}
      {!image && imageUrlInput && (
        <div className="mt-4">
          <img
            src={imageUrlInput}
            alt="URL Preview"
            className="w-full max-h-64 object-cover rounded"
            onError={() => alert('Invalid image URL')}
          />
        </div>
      )}

      <div className="mt-4 space-y-3">
        {/* Image upload */}
        <label className="block text-indigo-600 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setImage(e.target.files[0]);
              setImageUrlInput(''); // clear URL if file is selected
            }}
            className="hidden"
          />
          📷 Upload Image
        </label>

        {/* OR Image URL input */}
        <input
          type="text"
          placeholder="Or paste image URL"
          value={imageUrlInput}
          onChange={(e) => {
            setImageUrlInput(e.target.value);
            setImage(null); // clear file if URL is entered
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

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
