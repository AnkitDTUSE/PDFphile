import React, { useState, useRef } from "react";
import { 
  FileText, 
  Code, 
  FileCode2, 
  FileSignature, 
  Compass, 
  Upload, 
  File, 
  X, 
  ArrowRight,
  Loader,
  Cpu
} from "lucide-react";
import Chatbot from "./Chatbot";

const FORMATS = [
  { id: "html", name: "HTML", ext: ".html,.htm", desc: "HTML web page", icon: Code },
  { id: "docx", name: "Word (DOCX)", ext: ".docx", desc: "Microsoft Word doc", icon: FileText },
  { id: "mermaid", name: "Mermaid", ext: ".mmd,.mermaid,.txt", desc: "Mermaid diagram code", icon: FileCode2 },
  { id: "markdown", name: "Markdown", ext: ".md,.markdown,.txt", desc: "Markdown formatted text", icon: FileSignature },
  { id: "drawio", name: "Draw.io", ext: ".drawio,.xml", desc: "Drawio diagram XML", icon: Compass },
];

export default function ConverterDashboard({ 
  selectedFormat, 
  setSelectedFormat, 
  onConvertFile, 
  onOpenEditor,
  conversionLoading,
  user,
  onOpenLogin 
}) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);
  const fileInputRef = useRef(null);

  const activeFormatInfo = FORMATS.find(f => f.id === selectedFormat);

  const validateFile = (selectedFile) => {
    setError("");
    if (!selectedFile) return false;

    const fileName = selectedFile.name.toLowerCase();
    const extensions = activeFormatInfo.ext.split(",");
    const isValid = extensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setError(`Invalid file format. Please upload a file with these extensions: ${activeFormatInfo.ext}`);
      setFile(null);
      return false;
    }

    setFile(selectedFile);
    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConvert = () => {
    if (!file) return;
    onConvertFile(file, removeFile);
  };

  const supportsDirectEditor = ["html", "mermaid", "markdown"].includes(selectedFormat);

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-semibold text-neutral-100 tracking-tight mb-2">
            Convert Files to PDF
          </h1>
          <p className="text-sm text-neutral-400">
            Select a format, drop your document, and get a rendered PDF. Fast, local, and private.
          </p>
        {user && (
          <button
            onClick={() => setShowChatbot(prev => !prev)}
            className="flex items-center space-x-1.5 bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 border border-neutral-800 hover:border-neutral-700 px-3.5 py-2 rounded transition"
          >
            <Cpu className="w-3.5 h-3.5 text-neutral-400" />
            <span>{showChatbot ? 'Hide Chatbot' : 'Open Chatbot'}</span>
          </button>
        )}
      </div>

      {/* Format Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {FORMATS.map((format) => {
          const Icon = format.icon;
          const isActive = selectedFormat === format.id;
          return (
            <button
              key={format.id}
              onClick={() => {
                setSelectedFormat(format.id);
                removeFile();
              }}
              className={`p-4 rounded border text-left flex flex-col justify-between h-28 transition group ${
                isActive
                  ? "bg-neutral-900 border-neutral-400 text-neutral-100"
                  : "bg-neutral-900/40 border-neutral-800/80 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-neutral-200" : "text-neutral-500 group-hover:text-neutral-400"}`} />
              <div>
                <p className="text-xs font-semibold">{format.name}</p>
                <p className="text-[10px] text-neutral-500 mt-0.5 font-normal truncate">{format.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Upload Box / Dropzone */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-md p-8">
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-md p-10 flex flex-col items-center justify-center cursor-pointer transition ${
            dragActive 
              ? "border-neutral-300 bg-neutral-850" 
              : file 
                ? "border-neutral-800 cursor-default" 
                : "border-neutral-800 hover:border-neutral-700 bg-neutral-950/20"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={activeFormatInfo.ext}
            onChange={handleFileChange}
            className="hidden"
            disabled={!!file}
          />

          {file ? (
            <div className="w-full max-w-md flex items-center justify-between bg-neutral-950/50 border border-neutral-850 rounded px-4 py-3">
              <div className="flex items-center space-x-3 truncate">
                <div className="p-2 bg-neutral-900 rounded">
                  <File className="w-4 h-4 text-neutral-400" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-medium text-neutral-200 truncate">{file.name}</p>
                  <p className="text-[10px] text-neutral-500 font-normal">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="p-1 text-neutral-500 hover:text-neutral-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-10 h-10 rounded bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-4 h-4 text-neutral-400" />
              </div>
              <p className="text-xs font-medium text-neutral-300 mb-1">
                Drag and drop your file here, or <span className="underline">browse</span>
              </p>
              <p className="text-[10px] text-neutral-500">
                Supports {activeFormatInfo.ext.split(",").join(", ")} up to 10MB
              </p>
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-500 font-medium mt-3 text-center">{error}</p>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between border-t border-neutral-800/80 pt-6 gap-4">
          <div>
            {supportsDirectEditor && (
              <p className="text-xs text-neutral-400 font-normal">
                Want to write diagram code or text?{" "}
                <button
                  onClick={onOpenEditor}
                  className="text-neutral-200 underline font-medium hover:text-white transition"
                >
                  Write code directly
                </button>
              </p>
            )}
          </div>

          <button
            onClick={handleConvert}
            disabled={!file || conversionLoading}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-neutral-100 text-neutral-950 font-medium text-xs px-5 py-2.5 rounded hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            {conversionLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-1" />
                <span>Converting...</span>
              </>
            ) : (
              <>
                <span>Convert to PDF</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {showChatbot && user && (
        <div className="fixed bottom-6 right-6 w-96 h-[480px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-6rem)] bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-950 border-b border-neutral-800">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-neutral-400" />
              <span className="text-xs font-semibold text-neutral-200">AI Assistant</span>
            </div>
            <button
              onClick={() => setShowChatbot(false)}
              className="text-neutral-500 hover:text-neutral-300 transition p-1"
              aria-label="Close chatbot"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Content */}
          <div className="flex-1 overflow-hidden p-4">
            <Chatbot user={user} onOpenLogin={onOpenLogin} isFloating />
          </div>
        </div>
      )}
    </div>
  );
}
