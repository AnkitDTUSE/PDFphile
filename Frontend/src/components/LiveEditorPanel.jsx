import React, { useState, useEffect } from "react";
import { marked } from "marked";
import mermaid from "mermaid";
import { 
  ArrowLeft, 
  Loader, 
  Settings2, 
  FileDown,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Terminal,
  Link,
  Quote,
  Minus,
  Table,
  Type,
  Box,
  Image,
  Palette,
  LayoutGrid,
  Columns,
  Square,
  Circle,
  HelpCircle,
  ArrowRight,
  CornerDownRight,
  Sparkles,
  Layers
} from "lucide-react";

// Initialize mermaid
try {
  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    securityLevel: "loose",
    logLevel: 5,
  });
} catch (e) {
  console.error("Failed to initialize mermaid", e);
}

const DEFAULT_TEMPLATES = {
  html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 30px;
      color: #333;
    }
    h1 {
      color: #4f46e5;
    }
  </style>
</head>
<body>
  <h1>Hello PDFphile!</h1>
  <p>Type your HTML code here to generate a custom PDF file.</p>
</body>
</html>`,
  markdown: `# Markdown Document

Welcome to **PDFphile**!

## Features
- Minimalist design
- High quality output
- Fast locally

You can use standard markdown syntax:
- *Italics*
- **Bold**
- \`Code snippets\`
`,
  mermaid: `graph TD
  A[Start] --> B(Upload Document)
  B --> C{Choose Format}
  C -->|Markdown| D[Render Live PDF]
  C -->|Mermaid| E[Create Charts]
  C -->|HTML| F[Build Pages]
  D --> G[Download PDF]
  E --> G
  F --> G`,
};

const MARKDOWN_TOOLBAR_ITEMS = [
  { icon: Heading1, syntax: "# ", tooltip: "Heading 1" },
  { icon: Heading2, syntax: "## ", tooltip: "Heading 2" },
  { icon: Heading3, syntax: "### ", tooltip: "Heading 3" },
  { icon: Bold, syntax: "**Bold**", tooltip: "Bold text" },
  { icon: Italic, syntax: "*Italic*", tooltip: "Italic text" },
  { icon: List, syntax: "- ", tooltip: "Unordered list" },
  { icon: ListOrdered, syntax: "1. ", tooltip: "Ordered list" },
  { icon: Code, syntax: "`Code`", tooltip: "Inline code" },
  { icon: Terminal, syntax: "```\n\n```", tooltip: "Code block" },
  { icon: Link, syntax: "[Text](url)", tooltip: "Link" },
  { icon: Quote, syntax: "> ", tooltip: "Blockquote" },
  { icon: Minus, syntax: "---\n", tooltip: "Horizontal rule" },
  { icon: Table, syntax: "| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n", tooltip: "Table" },
];

const HTML_TOOLBAR_ITEMS = [
  { icon: Heading1, syntax: "<h1>Header 1</h1>", tooltip: "Heading 1" },
  { icon: Bold, syntax: "<strong>Bold</strong>", tooltip: "Bold text" },
  { icon: Italic, syntax: "<em>Italic</em>", tooltip: "Italic text" },
  { icon: Type, syntax: "<p>Paragraph</p>", tooltip: "Paragraph" },
  { icon: Box, syntax: "<div>\n  \n</div>", tooltip: "Div container" },
  { icon: Link, syntax: '<a href="https://">Link</a>', tooltip: "Link" },
  { icon: Image, syntax: '<img src="https://via.placeholder.com/150" alt="placeholder" />', tooltip: "Image" },
  { icon: List, syntax: "<ul>\n  <li>Item 1</li>\n</ul>", tooltip: "Unordered list" },
  { icon: Table, syntax: "<table>\n  <thead>\n    <tr>\n      <th>Header 1</th>\n      <th>Header 2</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Cell 1</td>\n      <td>Cell 2</td>\n    </tr>\n  </tbody>\n</table>", tooltip: "Table" },
  { icon: Palette, syntax: "<style>\n  body {\n    \n  }\n</style>", tooltip: "Style block" }
];

const MERMAID_TOOLBAR_ITEMS = [
  { icon: LayoutGrid, syntax: "graph TD\n  ", tooltip: "Flowchart (Top-Down)" },
  { icon: Columns, syntax: "graph LR\n  ", tooltip: "Flowchart (Left-Right)" },
  { icon: Square, syntax: "nodeId[Square Node]\n  ", tooltip: "Square Node" },
  { icon: Circle, syntax: "nodeId((Circle Node))\n  ", tooltip: "Circle Node" },
  { icon: HelpCircle, syntax: "nodeId{Decision}\n  ", tooltip: "Decision Diamond" },
  { icon: ArrowRight, syntax: "--> ", tooltip: "Arrow Link" },
  { icon: CornerDownRight, syntax: "-->|Text| ", tooltip: "Arrow Link with Text" },
  { icon: Sparkles, syntax: "==> ", tooltip: "Thick Arrow Link" },
  { icon: Layers, syntax: "subgraph Title\n  \nend", tooltip: "Subgraph" }
];

export default function LiveEditorPanel({ 
  format, 
  onBack, 
  onConvertContent, 
  conversionLoading 
}) {
  const [content, setContent] = useState(DEFAULT_TEMPLATES[format] || "");
  const [htmlPreview, setHtmlPreview] = useState("");
  const [svgContent, setSvgContent] = useState("");
  const [mermaidError, setMermaidError] = useState("");
  
  // Custom configuration state
  const [pageSize, setPageSize] = useState("A4");
  const [orientation, setOrientation] = useState("portrait");
  const [marginSize, setMarginSize] = useState("20mm");

  // Mobile UI States
  const [activeTab, setActiveTab] = useState("editor");
  const [showSettings, setShowSettings] = useState(false);



  // Insert formatting helper at cursor
  const handleInsertText = (syntax) => {
    const textarea = document.getElementById("editor-textarea");
    if (!textarea) {
      setContent((prev) => prev + syntax);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = content.substring(0, start);
    const textAfter = content.substring(end, content.length);

    setContent(textBefore + syntax + textAfter);

    setTimeout(() => {
      textarea.focus();
      const nextPos = start + syntax.length;
      textarea.setSelectionRange(nextPos, nextPos);
    }, 0);
  };

  // Handle Markdown compilation
  useEffect(() => {
    if (format === "markdown") {
      try {
        const rawHtml = marked.parse(content);
        setHtmlPreview(rawHtml);
      } catch (e) {
        console.error(e);
      }
    }
  }, [content, format]);

  // Handle Mermaid rendering (debounced)
  useEffect(() => {
    if (format !== "mermaid") return;

    const renderMermaid = async () => {
      if (!content.trim()) {
        setSvgContent("");
        setMermaidError("");
        return;
      }
      const uniqueId = `mermaid-svg-${Date.now()}`;
      try {
        setMermaidError("");
        // Clean temp target container
        const tempContainer = document.getElementById("mermaid-hidden-temp");
        if (tempContainer) {
          tempContainer.innerHTML = "";
        }

        // Render passing container reference to avoid appending to document.body
        const { svg } = await mermaid.render(uniqueId, content, tempContainer || undefined);
        setSvgContent(svg);
      } catch (err) {
        console.error("Mermaid error:", err);
        setMermaidError("Invalid Mermaid diagram syntax");
        
        // Clean up any stray elements appended by mermaid to the document body
        const strayElement = document.getElementById(uniqueId);
        if (strayElement) strayElement.remove();
        
        const bindElement = document.getElementById(`d${uniqueId}`);
        if (bindElement) bindElement.remove();
        
        Array.from(document.body.children).forEach(child => {
          if (child.id && (child.id.includes(uniqueId) || child.id.startsWith("dmermaid"))) {
            child.remove();
          }
          if (child.tagName === "SVG" && child.classList.contains("mermaid")) {
            child.remove();
          }
        });
      }
    };

    const debounceId = setTimeout(renderMermaid, 350);
    return () => {
      clearTimeout(debounceId);
      // Clean up any stray elements on document body starting with "dmermaid" or "mermaid-svg"
      Array.from(document.body.children).forEach(child => {
        if (child.id && (child.id.startsWith("dmermaid") || child.id.startsWith("mermaid-svg"))) {
          child.remove();
        }
        if (child.tagName === "SVG" && child.classList.contains("mermaid")) {
          child.remove();
        }
      });
    };
  }, [content, format]);

  const handleConvert = () => {
    onConvertContent({
      content,
      format,
      options: {
        pageSize,
        orientation,
        marginSize
      }
    });
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-neutral-200">
      {/* Top Header bar */}
      <div className="h-14 border-b border-neutral-850 flex items-center justify-between px-4 md:px-6 bg-neutral-900">
        <div className="flex items-center space-x-3 md:space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-1 md:space-x-2 text-xs text-neutral-400 hover:text-neutral-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <div className="h-4 w-px bg-neutral-800"></div>
          <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider truncate">
            {format} Editor
          </span>
        </div>

        {/* Conversion Settings bar */}
        <div className="flex items-center space-x-2 md:space-x-3 text-xs">
          {/* Desktop inline settings */}
          <div className="hidden md:flex items-center space-x-2 border-r border-neutral-800 pr-3">
            <Settings2 className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-[11px] text-neutral-300 focus:outline-none"
            >
              <option value="A4">A4</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
            </select>

            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-[11px] text-neutral-300 focus:outline-none"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>

            <select
              value={marginSize}
              onChange={(e) => setMarginSize(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-[11px] text-neutral-300 focus:outline-none"
            >
              <option value="10mm">Margin: 10mm</option>
              <option value="15mm">Margin: 15mm</option>
              <option value="20mm">Margin: 20mm</option>
              <option value="25mm">Margin: 25mm</option>
            </select>
          </div>

          {/* Mobile settings toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="md:hidden p-2 rounded bg-neutral-950 border border-neutral-850 hover:border-neutral-750 text-neutral-450 hover:text-neutral-200 transition focus:outline-none"
            title="Page Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleConvert}
            disabled={conversionLoading || !content.trim()}
            className="flex items-center space-x-1.5 bg-neutral-100 text-neutral-950 font-medium text-[11px] px-3.5 py-1.5 rounded hover:bg-neutral-200 disabled:opacity-30 transition"
          >
            {conversionLoading ? (
              <Loader className="w-3 h-3 animate-spin" />
            ) : (
              <FileDown className="w-3 h-3" />
            )}
            <span className="hidden sm:inline">Export PDF</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Mobile Settings panel */}
      {showSettings && (
        <div className="md:hidden flex flex-col space-y-2 p-4 bg-neutral-900 border-b border-neutral-850 animate-in fade-in slide-in-from-top duration-200">
          <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Page Configuration</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] text-neutral-400">Page Size</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded p-1.5 text-xs text-neutral-300 focus:outline-none w-full"
              >
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
                <option value="Legal">Legal</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] text-neutral-400">Orientation</span>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded p-1.5 text-xs text-neutral-300 focus:outline-none w-full"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] text-neutral-400">Margin Size</span>
              <select
                value={marginSize}
                onChange={(e) => setMarginSize(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded p-1.5 text-xs text-neutral-300 focus:outline-none w-full"
              >
                <option value="10mm">10mm</option>
                <option value="15mm">15mm</option>
                <option value="20mm">20mm</option>
                <option value="25mm">25mm</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Tab Toggle Bar */}
      <div className="md:hidden flex border-b border-neutral-850 bg-neutral-900/60">
        <button
          onClick={() => setActiveTab("editor")}
          className={`flex-1 py-3 text-center text-xs font-semibold border-b-2 transition ${
            activeTab === "editor"
              ? "border-neutral-100 text-neutral-100 bg-neutral-900/30"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 py-3 text-center text-xs font-semibold border-b-2 transition ${
            activeTab === "preview"
              ? "border-neutral-100 text-neutral-100 bg-neutral-900/30"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Preview
        </button>
      </div>

      {/* Hidden container for rendering Mermaid */}
      <div id="mermaid-hidden-temp" className="hidden"></div>

      {/* Editor & Preview Split Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left pane: Textarea Editor */}
        <div className={`w-full md:w-1/2 border-r border-neutral-850 flex flex-col h-full bg-neutral-900/10 ${activeTab === "editor" ? "flex" : "hidden md:flex"}`}>
          
          {/* Dynamic Formatting Toolbar based on format */}
          {((format === "markdown" && MARKDOWN_TOOLBAR_ITEMS) ||
            (format === "html" && HTML_TOOLBAR_ITEMS) ||
            (format === "mermaid" && MERMAID_TOOLBAR_ITEMS)) && (
            <div className="flex items-center space-x-1 px-4 py-2 border-b border-neutral-850 bg-neutral-900/40 overflow-x-auto scrollbar-none">
              {(format === "markdown" ? MARKDOWN_TOOLBAR_ITEMS :
                format === "html" ? HTML_TOOLBAR_ITEMS :
                MERMAID_TOOLBAR_ITEMS).map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleInsertText(item.syntax)}
                    title={item.tooltip}
                    className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition"
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
          )}

          <textarea
            id="editor-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 p-6 bg-transparent text-sm font-mono leading-relaxed placeholder-neutral-700 resize-none focus:outline-none text-neutral-300 w-full"
            placeholder={`Enter your ${format} content here...`}
          />
        </div>

        {/* Right pane: Visual Render Preview */}
        <div className={`w-full md:w-1/2 bg-neutral-950 flex flex-col h-full p-4 md:p-8 select-none overflow-hidden ${activeTab === "preview" ? "flex" : "hidden md:flex"}`}>
          <div className="flex-1 border border-neutral-850 rounded bg-neutral-900/30 overflow-auto relative">
            {/* HTML Preview Renderer */}
            {format === "html" && (
              <iframe
                title="HTML Live Preview"
                srcDoc={content}
                sandbox="allow-scripts"
                className="w-full h-full bg-white border-0"
              />
            )}

            {/* Markdown Preview Renderer */}
            {format === "markdown" && (
              <div 
                className="p-4 md:p-8 prose prose-invert max-w-none text-sm text-neutral-300"
                dangerouslySetInnerHTML={{ __html: htmlPreview }}
              />
            )}

            {/* Mermaid Preview Renderer */}
            {format === "mermaid" && (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8 overflow-auto">
                {mermaidError ? (
                  <p className="text-xs text-neutral-500 font-mono">{mermaidError}</p>
                ) : svgContent ? (
                  <div 
                    className="w-full max-w-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                ) : (
                  <p className="text-xs text-neutral-600 font-mono">Empty diagram layout</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
