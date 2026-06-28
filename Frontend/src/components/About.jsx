import React from "react";
import { ShieldCheck, FileText, Sparkles, Cpu, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 md:py-12 md:px-6 text-slate-100">
      {/* Hero section */}
      <div className="text-center mb-16 relative">
        <div className="absolute inset-0 -top-12 bg-indigo-500/10 blur-3xl rounded-full w-72 h-72 mx-auto"></div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-indigo-200 to-indigo-400 mb-4 relative">
          About PDFphile
        </h1>
        <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto leading-relaxed relative">
          PDFphile is a private, powerful web-based utility for rendering markdown, HTML templates, and complex Mermaid charts directly into high-quality PDF files.
        </p>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition duration-300">
          <div className="w-10 h-10 rounded bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 mb-2">100% Privacy Focused</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All document formatting, code edits, and visual render Previews happen entirely inside your web browser. No document files or source files are uploaded or stored on remote servers.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition duration-300">
          <div className="w-10 h-10 rounded bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20">
            <Zap className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 mb-2">Instant Local Builds</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Transform scripts and files to PDFs in seconds. We pack a blazing-fast local processing interface that lets you edit HTML styling and preview page structures instantly.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition duration-300">
          <div className="w-10 h-10 rounded bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 mb-2">Gemini AI Summaries</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Need to extract key pointers? Our Gemini AI integration reads and processes your files, providing key points and answering follow-up queries via the Assistant Chatbot.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition duration-300">
          <div className="w-10 h-10 rounded bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20">
            <FileText className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 mb-2">Multi-Format Support</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Support for classic HTML structures, easy-to-read Markdown document layouts, and complex database schemas/flowcharts written using Mermaid diagram code formats.
          </p>
        </div>
      </div>

      {/* Tech Stack Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 md:p-8 mb-12">
        <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center space-x-2">
          <Cpu className="w-4.5 h-4.5 text-indigo-400" />
          <span>Under The Hood</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          PDFphile is built using a modern React frontend compiler layered on Vite, styled with Tailwind CSS, and powered by standard Javascript libraries like marked for markdown compiling and mermaid.js for SVG graph renders.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="bg-slate-950 border border-slate-850 px-2.5 py-1 rounded text-[10px] text-slate-350">React 19</span>
          <span className="bg-slate-950 border border-slate-850 px-2.5 py-1 rounded text-[10px] text-slate-350">Vite 8</span>
          <span className="bg-slate-950 border border-slate-850 px-2.5 py-1 rounded text-[10px] text-slate-350">Tailwind CSS 3</span>
          <span className="bg-slate-950 border border-slate-850 px-2.5 py-1 rounded text-[10px] text-slate-350">Mermaid JS</span>
          <span className="bg-slate-950 border border-slate-850 px-2.5 py-1 rounded text-[10px] text-slate-350">Node.js Express</span>
        </div>
      </div>

      {/* CTA section */}
      <div className="text-center">
        <Link
          to="/convert"
          className="inline-flex items-center space-x-2 bg-indigo-650 hover:bg-indigo-600 text-white font-medium text-xs px-5 py-2.5 rounded transition shadow-lg shadow-indigo-600/10 focus:outline-none"
        >
          <span>Start Converting Files</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
