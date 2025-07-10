// components/NewChatModal.js
import React, { useState } from "react";

export default function NewChatModal({ onClose, onUploadText, onUploadPDF }) {
  const [selectedOption, setSelectedOption] = useState("");

  const handleUpload = () => {
    if (selectedOption === "text") onUploadText();
    else if (selectedOption === "pdf") document.getElementById("hiddenPdfInput").click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-80">
        <h2 className="text-lg font-semibold mb-4 text-center">Start a New Chat</h2>

        <div className="flex flex-col gap-2 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="uploadOption"
              value="text"
              checked={selectedOption === "text"}
              onChange={() => setSelectedOption("text")}
            />
            Upload Text
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="uploadOption"
              value="pdf"
              checked={selectedOption === "pdf"}
              onChange={() => setSelectedOption("pdf")}
            />
            Upload PDF
          </label>
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-500"
            disabled={!selectedOption}
          >
            Continue
          </button>
        </div>

        {/* Hidden PDF input for triggering file selection */}
        <input
          type="file"
          id="hiddenPdfInput"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            onUploadPDF(e.target.files[0]);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
