import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ConverterDashboard from "./components/ConverterDashboard";
import LiveEditorPanel from "./components/LiveEditorPanel";
import HistoryWorkspace from "./components/HistoryWorkspace";
import AuthModal from "./components/AuthModal";

function AppContent() {
  const navigate = useNavigate();
  const [selectedFormat, setSelectedFormat] = useState("html");
  const [conversionLoading, setConversionLoading] = useState(false);

  // User Authentication State
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
    <div className="flex min-h-screen bg-slate-950 text-neutral-100 font-sans">
      <Sidebar
        user={user}
        onLogOut={handleLogOut}
        onOpenLogin={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-1 overflow-auto h-screen">
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
