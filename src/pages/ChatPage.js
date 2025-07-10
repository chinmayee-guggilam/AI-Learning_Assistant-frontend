import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ChatBot from "../components/ChatBot";
import TextUploadModal from "../components/TextUploadModal";
import NewChatModal from "../components/NewChatModal";

export default function ChatPage() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [showTextModal, setShowTextModal] = useState(false);
  const [textUploadForChat, setTextUploadForChat] = useState(null);
  const [showNewChatOptions, setShowNewChatOptions] = useState(false);
  const [profile, setProfile] = useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    fetchChats();
    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:5000/api/user/me", {
    headers: { Authorization: token },
  });
  const data = await res.json();
  setProfile(data);
};

const triggerSuggestionAction = async (suggestion, chatId) => {
  const token = localStorage.getItem("token");

  let message;
  if (suggestion.includes("Summarize")) {
    message = "Summarize this document.";
  } else if (suggestion.includes("questions")) {
    message = "Give me some questions based on this document.";
  } else if (suggestion.includes("quiz")) {
    navigate(`/quiz/${chatId}`);
    setSelectedSuggestion(null);
    return;
  } else if (suggestion.includes("concepts")) {
    message = "List the key concepts from the uploaded content.";
  } else {
    message = suggestion;
  }

  // Auto-send first message to chatbot
  await fetch("http://localhost:5000/api/save-chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ chatId, message, role: "user" }),
  });

  // Reload chat
  const updated = await fetch(`http://localhost:5000/api/chat/${chatId}`, {
    headers: { Authorization: token },
  });
  const chatData = await updated.json();
  setSelectedChat(chatData.chat);
  setSelectedSuggestion(null);
};

  const fetchChats = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/chat-history", {
      headers: { Authorization: token },
    });
    const data = await res.json();
    setChats(data.chats || []);
  };

  const renameChat = async (chatId, newName) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:5000/api/rename-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ chatId, newName }),
      });
      fetchChats();
    } catch (err) {
      console.error("Rename failed", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleNewChat = () => {
    setSelectedChat(null);
    setTextUploadForChat("new");
    setShowNewChatOptions(true);
    setShowNewChatModal(true);
  };

  const handlePDFUpload = async (file, chatId) => {
  if (!file) return;
  setUploadStatus("Uploading...");
  const formData = new FormData();
  formData.append("file", file);
  if (chatId) formData.append("chatId", chatId);
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("http://localhost:5000/api/upload-pdf", {
      method: "POST",
      headers: { Authorization: token },
      body: formData,
    });

    const data = await res.json();
    const newChatId = data.chatId;
    setUploadStatus("Uploaded ✅");
    await fetchChats();

    if (newChatId) {
      const updated = await fetch(`http://localhost:5000/api/chat/${newChatId}`, {
        headers: { Authorization: token },
      });
      const chatData = await updated.json();
      setSelectedChat(chatData.chat);

      // 🧠 Trigger suggestion prompt after upload (if any)
      if (selectedSuggestion && chatData.chat) {
        await triggerSuggestionAction(selectedSuggestion, chatData.chat._id);
      }
    }
  } catch {
    setUploadStatus("Upload failed ❌");
  } finally {
    setTimeout(() => setUploadStatus(""), 3000);
  }
};

  const deleteChat = async (chatId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this chat?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/chat/${chatId}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });

      const data = await res.json();
      if (data.success) {
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        if (selectedChat && selectedChat._id === chatId) {
          setSelectedChat(null);
        }
        await fetchChats();
      } else {
        console.error("❌ Delete failed:", data.error);
      }
    } catch (err) {
      console.error("❌ Delete API error:", err);
    }
  };

  const handleTextUpload = async (text, chatId) => {
  if (!text?.trim()) return;
  setUploadStatus("Uploading...");
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5000/api/content", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ text, chatId }),
  });

  const data = await res.json();
  const newChatId = data.chatId;

  setUploadStatus("Uploaded ✅");
  await fetchChats();

  if (newChatId) {
    const updated = await fetch(`http://localhost:5000/api/chat/${newChatId}`, {
      headers: { Authorization: token },
    });
    const chatData = await updated.json();
    setSelectedChat(chatData.chat);

    // 🧠 Trigger prompt after upload
    if (selectedSuggestion && chatData.chat) {
      await triggerSuggestionAction(selectedSuggestion, chatData.chat._id);
    }
  }

  setTimeout(() => setUploadStatus(""), 3000);
};

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-4 space-y-4">
        <h2 className="text-xl font-bold mb-2">Previous Chats</h2>
        <button
          onClick={handleNewChat}
          className="w-full bg-green-600 hover:bg-green-500 text-white p-2 rounded font-semibold"
        >
          ➕ New Chat
        </button>

        <div className="flex-1 overflow-y-auto space-y-2">
          {chats.map((chat) => {
            const isMenuOpen = chat._id === textUploadForChat;

            return (
              <div
                key={chat._id}
                className="flex items-center justify-between bg-gray-800 p-2 rounded hover:bg-gray-700 relative"
              >
                <button
                  onClick={() => {
                    setSelectedChat(chat);
                    setShowNewChatOptions(false);
                  }}
                  className="text-left flex-1 truncate"
                >
                  {chat.summary || "Untitled Chat"}
                </button>

                <div className="relative">
                  <button
                    className="text-xl px-2"
                    onClick={() =>
                      setTextUploadForChat(isMenuOpen ? null : chat._id)
                    }
                  >
                    ⋯
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 bg-white text-black rounded shadow-lg w-40 z-50">
                      <button
                        onClick={() => {
                          setTextUploadForChat(chat._id); // 👈 Set the chat ID
                          setShowTextModal(true);         // 👈 Then open modal
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Append Text
                      </button>
                      <label className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        Append PDF
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => {
                            handlePDFUpload(e.target.files[0], chat._id);
                            setTextUploadForChat(null);
                          }}
                          className="hidden"
                        />
                      </label>

                      <button
                        onClick={() => {
                          const newTitle = prompt("Enter new chat name:");
                          if (newTitle?.trim()) {
                            renameChat(chat._id, newTitle.trim());
                            setTextUploadForChat(null);
                          }
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Rename Chat
                      </button>

                      <button
                        onClick={() => {
                          deleteChat(chat._id);
                          setTextUploadForChat(null);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                      >
                        🗑 Delete Chat
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-500 p-2 rounded mt-4"
        >
          Logout
        </button>
      </aside>

      {/* Chat Section */}
      <main className="flex-grow flex flex-col bg-gray-100 dark:bg-gray-900 dark:text-white">
        <header className="bg-white p-4 shadow flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-800">
            AI Learning Assistant
          </h1>

          <div className="flex items-center gap-6">
            {uploadStatus && (
              <span className="text-green-600 text-sm">{uploadStatus}</span>
            )}
            {selectedChat?.content?.length > 0 && (
              <button
                onClick={() => navigate(`/quiz/${selectedChat._id}`)}
                className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-sm"
              >
                🧠 Prepare a Quiz Now
              </button>
            )}
            {showNewChatModal && (
  <NewChatModal
    onClose={() => setShowNewChatModal(false)}
    onUploadText={() => {
      setShowTextModal(true);
      setShowNewChatModal(false);
    }}
    onUploadPDF={(file) => handlePDFUpload(file, null)}
  />
)}
            <div
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <img
  src={
    profile?.profilePic
      ? `http://localhost:5000${profile.profilePic}`
      : "https://api.dicebear.com/7.x/initials/svg?seed=User"
  }
  alt="Profile"
  className="w-8 h-8 rounded-full border object-cover"
/>
<span className="text-sm text-gray-700 font-medium">
  {profile?.username || "Profile"}
</span>
            </div>
          </div>
        </header>

        <div className="flex-grow">
  {selectedChat ? (
    <ChatBot selectedChat={selectedChat} chatId={selectedChat?._id} />
  ) : (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-700 px-4">
      <h2 className="text-3xl font-bold mb-2">
        Welcome{profile?.username ? `, ${profile.username}` : ""} 👋
      </h2>
      <p className="text-lg mb-6">
        I'm your AI Learning Assistant. Upload your content and ask me anything!
      </p>

      <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          "📄 Summarize this document",
          "❓ Ask questions based on PDF",
          "📝 Generate a quiz for me",
          "🧠 What are the key concepts?",
        ].map((prompt, index) => (
  <div
    key={index}
    className="bg-white border rounded-lg shadow hover:shadow-md p-4 text-sm cursor-pointer transition-all"
    onClick={() => {
      setSelectedSuggestion(prompt);      // Store what the user clicked
      handleNewChat();                    // Start new chat and ask for content
    }}
  >
    {prompt}
  </div>
))}
      </div>
    </div>
  )}
</div>

      </main>

      {/* Text Upload Modal */}
      {showTextModal && (
        <TextUploadModal
          onClose={() => setShowTextModal(false)}
          onUpload={(text) =>
            handleTextUpload(
              text,
              textUploadForChat === "new" ? null : textUploadForChat
            )
          }
        />
      )}
    </div>
  );
}
