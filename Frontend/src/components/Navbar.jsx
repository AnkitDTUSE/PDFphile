import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Cpu, LogOut, User, ChevronDown, Info } from "lucide-react";
import Logo from "../assets/logo.png";

export default function Navbar({
  user,
  onLogOut,
  onOpenLogin,
  onToggleChatbot,
  showChatbot,
  onOpenMobileMenu,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      {/* Brand logo & mobile hamburger */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center space-x-2.5">
          <img src={Logo} alt="PDFphile Logo" className="w-8 h-8 object-contain rounded" />
          <span className="text-base font-bold tracking-tight text-slate-100">PDFphile</span>
        </Link>
      </div>

      {/* Main navigation links (desktop) */}
      <nav className="hidden md:flex items-center space-x-1">
        <NavLink
          to="/convert"
          className={({ isActive }) =>
            `px-3 py-1.5 rounded text-xs font-semibold tracking-wide transition ${
              isActive
                ? "bg-slate-800 text-slate-100"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`
          }
        >
          Convert Files
        </NavLink>

        <NavLink
          to="/library"
          className={({ isActive }) =>
            `px-3 py-1.5 rounded text-xs font-semibold tracking-wide transition ${
              isActive
                ? "bg-slate-800 text-slate-100"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`
          }
        >
          My Library
        </NavLink>

      </nav>

      {/* Action panel (Chatbot + Login/Profile) */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Global chatbot button */}
        <button
          onClick={onToggleChatbot}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition focus:outline-none border ${
            showChatbot
              ? "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700"
          }`}
          title="Toggle AI Chatbot"
        >
          <Cpu className={`w-3.5 h-3.5 ${showChatbot ? "animate-pulse" : "text-slate-400"}`} />
          <span className="hidden sm:inline">AI Chatbot</span>
        </button>

        <div className="h-4 w-px bg-slate-800"></div>

        {/* Profile / Auth container */}
        <div className="relative" ref={dropdownRef}>
          {user ? (
            <div className="flex items-center">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-1.5 p-1 rounded-md hover:bg-slate-800 transition focus:outline-none text-slate-300 hover:text-slate-200"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white border border-indigo-400/30">
                  {user.username?.substring(0, 2).toUpperCase()}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile drop-down overlay */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-800 rounded-md shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-850">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {user.fullName || user.username}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onLogOut();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-950 rounded text-xs font-semibold transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
