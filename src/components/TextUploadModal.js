// src/components/TextUploadModal.js
import React, { useState } from "react";

export default function TextUploadModal({ onUpload, onClose }) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim()) {
      onUpload(text.trim());
      setText("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Upload Text Content</h2>
        <textarea
          rows="6"
          value={text}
          onChange={e => setText(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          placeholder="Paste or type content here..."
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
