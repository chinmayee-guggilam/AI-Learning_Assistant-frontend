import React, { useState, useEffect, useRef } from "react";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
}

const ChatBot = ({ selectedChat, newChatCount }) => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [listening, setListening] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages || []);
      setUploaded(
        selectedChat.content && selectedChat.content.trim().length > 0
      );
    } else {
      setMessages([]);
      setUploaded(false);
    }
  }, [selectedChat, newChatCount]);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  const handleVoiceInput = () => {
    if (!recognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      setQuestion(voiceText);
      setListening(false);
    };

    recognition.onerror = () => {
      alert("Voice recognition error occurred.");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  const sendMessage = async () => {
    if (!question.trim()) return;
    if (!uploaded) {
      alert("⚠️ Please upload content before chatting.");
      return;
    }

    const token = localStorage.getItem("token");
    const chatId = selectedChat?._id;

    const userMessage = { text: question, sender: "user" };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ question, chatId }),
      });

      const data = await res.json();
      const botResponse = data.answer || "Sorry, I couldn't answer.";
      const botMessage = { text: botResponse, sender: "bot" };

      const finalMessages = [...updated, botMessage];
      setMessages(finalMessages);

      await fetch("http://localhost:5000/api/save-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          messages: finalMessages,
          chatId: chatId,
        }),
      });
    } catch {
      const errorMsg = "Error connecting to AI server.";
      setMessages((prev) => [...prev, { text: errorMsg, sender: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Display */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 max-h-[calc(100vh-160px)]">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`relative max-w-sm px-4 py-2 rounded-lg shadow text-sm ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-900 rounded-bl-none"
              }`}
            >
              {msg.text}

              {/* 🔊 Speaker button for bot replies */}
              {msg.sender === "bot" && (
                <button
                  onClick={() => speak(msg.text)}
                  className="absolute -right-6 top-1 text-gray-500 hover:text-black"
                  title="Read aloud"
                >
                  🔊
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-gray-500 italic animate-pulse">Thinking...</div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-300 p-3 bg-white flex items-center gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask something..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={handleVoiceInput}
          title="Speak"
          className={`px-3 py-2 rounded-full text-white ${
            listening ? "bg-yellow-500" : "bg-blue-400 hover:bg-blue-500"
          }`}
        >
          🎤
        </button>

        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
