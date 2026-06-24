import React, { useState } from "react";
import { Loader, Send } from "lucide-react";
import axios from "axios";

export default function Chatbot({ user, onOpenLogin, isFloating = false }) {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! I am your PDFphile AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!user) {
      onOpenLogin();
      return;
    }
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("/api/v1/ai/chat", {
        message: userMsg,
        history: messages,
      });

      if (response.data && response.data.data && response.data.data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: response.data.data.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: "Sorry, I couldn't get a response." },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: err.response?.data?.message || "Failed to reach AI helper. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${isFloating ? "w-full" : "bg-neutral-900 border border-neutral-800 rounded-md p-4 max-h-80"}`}>
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === "user" ? "text-right" : "text-left"}>
            <span
              className={msg.role === "user" ? "inline-block bg-neutral-700 text-neutral-200 px-3 py-1 rounded" : "inline-block bg-neutral-800 text-neutral-300 px-3 py-1 rounded"}
            >
              {msg.text}
            </span>
          </div>
        ))}
        {loading && (
          <div className="text-left">
            <span className="inline-block bg-neutral-800 text-neutral-300 px-3 py-1 rounded">
              <Loader className="inline w-4 h-4 mr-2 animate-spin" /> Generating summary…
            </span>
          </div>
        )}
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          className="flex-1 bg-neutral-800 text-neutral-200 border border-neutral-700 rounded px-3 py-1 focus:outline-none"
          placeholder="Ask a question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          className="flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 text-neutral-200 px-3 py-1 rounded disabled:opacity-50"
          disabled={loading}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
