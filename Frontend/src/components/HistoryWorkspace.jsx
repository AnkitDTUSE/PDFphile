import React, { useState } from "react";
import axios from "axios";
import {
  FileText,
  Trash2,
  Cpu,
  Clock,
  ChevronRight,
  Download,
  Loader,
  X,
  AlertCircle
} from "lucide-react";
import Chatbot from "./Chatbot";

export default function HistoryWorkspace({ historyList, onClearHistory, user, onOpenLogin }) {
  const [summarizingId, setSummarizingId] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);
  const [selectedFileForAi, setSelectedFileForAi] = useState(null);

  const handleSummarizeClick = (item) => {
    if (!user) {
      onOpenLogin();
      return;
    }
    setSummaryData(null);
    setError("");
    setSelectedFileForAi(item);
  };

  const handleFileUploadAndSummarize = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setSummarizingId(selectedFileForAi.id);
    setError("");

    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const response = await axios.post("/api/v1/ai/createSummary", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.data) {
        const summaryText = typeof response.data.data === "object"
          ? response.data.data.summary
          : response.data.data;
        setSummaryData({
          filename: selectedFileForAi.filename,
          summary: summaryText,
        });
      } else {
        setError("Could not generate summary.");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        "Failed to generate summary. Please check your AI API key/credentials."
      );
    } finally {
      setSummarizingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-10">
        <div>
          <button
            onClick={() => setShowChatbot(prev => !prev)}
            className="flex items-center space-x-1.5 bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 border border-neutral-800 hover:border-neutral-700 px-3 py-1.5 rounded transition mb-4"
          >
            <Cpu className="w-3 h-3 text-neutral-400" />
            <span>{showChatbot ? 'Hide' : 'Open'} Chatbot</span>
          </button>
          <h1 className="text-2xl font-semibold text-neutral-100 tracking-tight mb-2">
            My Library & History
          </h1>
          <p className="text-sm text-neutral-400">
            A local log of your document conversions. No files are stored on our servers.
          </p>
        </div>
        {historyList.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center space-x-2 text-xs text-neutral-500 hover:text-red-400 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {historyList.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-md p-12 text-center">
          <Clock className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
          <p className="text-xs text-neutral-400">No conversions recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {historyList.map((item) => (
            <div
              key={item.id}
              className="bg-neutral-900 border border-neutral-800 rounded-md p-4 flex items-center justify-between hover:border-neutral-700 transition"
            >
              <div className="flex items-center space-x-4">
                <div className="w-9 h-9 bg-neutral-950 rounded flex items-center justify-center border border-neutral-800">
                  <FileText className="w-4 h-4 text-neutral-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-200">{item.filename}</p>
                  <div className="flex items-center space-x-2 text-[10px] text-neutral-500 mt-1">
                    <span>{item.format?.toUpperCase()}</span>
                    <span>•</span>
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleSummarizeClick(item)}
                  disabled={summarizingId === item.id}
                  className="flex items-center space-x-1.5 bg-neutral-950 hover:bg-neutral-800 text-[10px] font-semibold text-neutral-300 border border-neutral-800 hover:border-neutral-700 px-3 py-1.5 rounded transition"
                >
                  {summarizingId === item.id ? (
                    <Loader className="w-3 h-3 animate-spin text-neutral-400" />
                  ) : (
                    <Cpu className="w-3 h-3 text-neutral-400" />
                  )}
                  <span>AI Summarize</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chatbot component */}
      {showChatbot && (
        <div className="mt-6">
          <Chatbot user={user} onOpenLogin={onOpenLogin} />
        </div>
      )}
      {selectedFileForAi && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 max-w-lg w-full rounded-md shadow-lg p-6 relative">
            <button
              onClick={() => {
                setSelectedFileForAi(null);
                setSummaryData(null);
                setError("");
              }}
              className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-300 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-semibold text-neutral-200 mb-2 flex items-center space-x-2">
              <Cpu className="w-4.5 h-4.5 text-neutral-400" />
              <span>AI Document summarizer</span>
            </h3>
            <p className="text-xs text-neutral-400 mb-6">
              Summarize <span className="font-semibold text-neutral-300">{selectedFileForAi.filename}</span>.
            </p>

              {!user ? (
                <div className="bg-neutral-950/60 border border-neutral-800 rounded p-4 text-center">
                  <AlertCircle className="w-5 h-5 text-neutral-500 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400 mb-3">You must be signed in to use AI summaries.</p>
                  <button
                    onClick={() => {
                      setSelectedFileForAi(null);
                      onOpenLogin();
                    }}
                    className="bg-neutral-100 hover:bg-neutral-200 text-neutral-950 px-4 py-1.5 rounded text-xs font-semibold transition"
                  >
                    Sign In Now
                  </button>
                </div>
              ) : summaryData ? (
                <div className="space-y-4">
                  <div className="bg-neutral-950/80 border border-neutral-800 rounded p-4 overflow-auto max-h-60">
                    <p className="text-xs text-neutral-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {summaryData.summary}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setSelectedFileForAi(null)}
                      className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-4 py-1.5 rounded text-xs font-semibold transition"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border border-dashed border-neutral-800 rounded-md p-6 text-center">
                    <label className="cursor-pointer bg-neutral-950 border border-neutral-850 hover:border-neutral-700 hover:bg-neutral-900 text-neutral-300 hover:text-white px-4 py-2 rounded text-xs font-medium inline-block transition">
                      Upload PDF File to Summarize
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileUploadAndSummarize}
                      />
                    </label>
                    <p className="text-[10px] text-neutral-500 mt-2">
                      Upload the converted PDF file to fetch the summary.
                    </p>
                  </div>

                  {error && (
                    <p className="text-xs text-red-500 font-medium text-center">{error}</p>
                  )}

                  {summarizingId && (
                    <div className="flex items-center justify-center space-x-2 py-4">
                      <Loader className="w-4 h-4 animate-spin text-neutral-400" />
                      <span className="text-xs text-neutral-400">Processing file with Gemini...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}