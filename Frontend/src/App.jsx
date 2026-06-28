import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import Sidebar from "./components/Sidebar";
import ConverterDashboard from "./components/ConverterDashboard";
import LiveEditorPanel from "./components/LiveEditorPanel";
import HistoryWorkspace from "./components/HistoryWorkspace";
import AuthModal from "./components/AuthModal";
import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";

function AppContent() {
  const navigate = useNavigate();
  const [selectedFormat, setSelectedFormat] = useState("html");
  const [conversionLoading, setConversionLoading] = useState(false);

  // User Authentication State
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  // Local storage history state
  const [historyList, setHistoryList] = useState(() => {
    try {
      const stored = localStorage.getItem("pdfphile_history");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Keep local storage in sync
  useEffect(() => {
    localStorage.setItem("pdfphile_history", JSON.stringify(historyList));
  }, [historyList]);

  // Check login status / session on boot (silent backend query)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedUser = localStorage.getItem("pdfphile_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Session check failed", e);
      }
    };
    checkSession();
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("pdfphile_user", JSON.stringify(userData));
  };

  const handleLogOut = async () => {
    try {
      await axios.post("/api/v1/user/logout");
    } catch (err) {
      console.error("Logout request failed, cleaning local state anyway", err);
    } finally {
      setUser(null);
      localStorage.removeItem("pdfphile_user");
    }
  };

  // Convert File (From Dashboard drag and drop / upload or editor)
  const handleConvertFile = async (uploadedFile, onSuccessCallback, targetFormat, options = {}) => {
    setConversionLoading(true);
    const formData = new FormData();
    formData.append("file", uploadedFile);

    if (options.pageSize) formData.append("pageSize", options.pageSize);
    if (options.orientation) formData.append("orientation", options.orientation);
    if (options.marginSize) formData.append("marginSize", options.marginSize);

    const formatToUse = targetFormat || selectedFormat;
    const endpointName = `convert${
      formatToUse.charAt(0).toUpperCase() + formatToUse.slice(1)
    }`;

    try {
      const response = await axios.post(`/api/v1/file/${endpointName}`, formData, {
        responseType: "blob", // Treat response as raw binary PDF content
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Trigger automatic file download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      const originalBase = uploadedFile.name.substring(0, uploadedFile.name.lastIndexOf(".")) || uploadedFile.name;
      link.href = downloadUrl;
      link.setAttribute("download", `${originalBase}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      // Record Conversion in local library history
      const newHistoryItem = {
        id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        filename: `${originalBase}.pdf`,
        format: formatToUse,
        timestamp: new Date().toISOString(),
        size: uploadedFile.size,
      };
      setHistoryList((prev) => [newHistoryItem, ...prev]);

      if (onSuccessCallback) onSuccessCallback();
    } catch (err) {
      console.error(err);
      alert(
        "Conversion failed. Please verify that the backend is active and that your document structure is correct."
      );
    } finally {
      setConversionLoading(false);
    }
  };

  // Convert Raw Text Editor Content (Markdown, Mermaid, HTML)
  const handleConvertContent = async ({ content, format, options }) => {
    const extensionsMap = {
      html: "document.html",
      markdown: "document.md",
      mermaid: "document.mmd",
    };
    const mimeTypesMap = {
      html: "text/html",
      markdown: "text/markdown",
      mermaid: "text/plain",
    };

    const fileName = extensionsMap[format] || "document.txt";
    const mimeType = mimeTypesMap[format] || "text/plain";
    
    const virtualFile = new File([content], fileName, { type: mimeType });
    await handleConvertFile(virtualFile, () => {
      navigate("/convert"); // Redirect to converter dashboard after successful export
    }, format, options);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your local conversion logs?")) {
      setHistoryList([]);
    }
  };

  return (
    <div className="flex flex-col h-dvh bg-slate-950 text-neutral-100 font-sans overflow-hidden">
      {/* Global Top Navbar */}
      <Navbar
        user={user}
        onLogOut={handleLogOut}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        onToggleChatbot={() => setShowChatbot((prev) => !prev)}
        showChatbot={showChatbot}
        onOpenMobileMenu={() => setIsSidebarOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Backdrop for Mobile Drawer */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <Sidebar
          user={user}
          onLogOut={handleLogOut}
          onOpenLogin={() => setIsAuthModalOpen(true)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 overflow-auto bg-slate-950">
          <Routes>
            <Route path="/" element={<Navigate to="/convert" replace />} />
            <Route
              path="/convert"
              element={
                <ConverterDashboard
                  selectedFormat={selectedFormat}
                  setSelectedFormat={setSelectedFormat}
                  onConvertFile={(file, onSuccess) => handleConvertFile(file, onSuccess, selectedFormat)}
                  onOpenEditor={() => navigate(`/editor/${selectedFormat}`)}
                  conversionLoading={conversionLoading}
                  user={user}
                  onOpenLogin={() => setIsAuthModalOpen(true)}
                />
              }
            />
            <Route
              path="/editor/:format"
              element={<EditorWrapper onConvertContent={handleConvertContent} conversionLoading={conversionLoading} />}
            />
            <Route
              path="/library"
              element={
                <HistoryWorkspace
                  historyList={historyList}
                  onClearHistory={handleClearHistory}
                  user={user}
                  onOpenLogin={() => setIsAuthModalOpen(true)}
                />
              }
            />
            <Route path="*" element={<Navigate to="/convert" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global AI Chatbot floating drawer */}
      {showChatbot && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-96 h-[480px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-4rem)] bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-200">AI Assistant Chatbot</span>
            </div>
            <button
              onClick={() => setShowChatbot(false)}
              className="text-slate-500 hover:text-slate-300 transition p-1"
              aria-label="Close chatbot"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Content */}
          <div className="flex-1 overflow-hidden p-4">
            <Chatbot user={user} onOpenLogin={() => setIsAuthModalOpen(true)} isFloating />
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

// Wrapper component to pass parameter to LiveEditorPanel and validate format
function EditorWrapper({ onConvertContent, conversionLoading }) {
  const { format } = useParams();
  const navigate = useNavigate();

  const validFormats = ["html", "markdown", "mermaid"];
  if (!validFormats.includes(format)) {
    return <Navigate to="/convert" replace />;
  }

  return (
    <LiveEditorPanel
      key={format}
      format={format}
      onBack={() => navigate("/convert")}
      onConvertContent={onConvertContent}
      conversionLoading={conversionLoading}
    />
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
