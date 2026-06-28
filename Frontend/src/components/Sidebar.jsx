import { NavLink } from "react-router-dom";
import { FileCode, History, LogOut, User, X, Code, FileSignature, GitFork, Info } from "lucide-react";
import Logo from "../assets/logo.png";

export default function Sidebar({ user, onLogOut, onOpenLogin, isOpen, onClose }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen transition-transform duration-300 md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-6 overflow-y-auto flex-1">
        {/* Mobile Header (Hidden on desktop) */}
        <div className="flex items-center justify-between mb-8 md:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-md">
              <img src={Logo} alt="PDFphile Logo" className="w-full h-full object-contain rounded-md" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-100">PDFphile</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 focus:outline-none"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Categories */}
        <div className="space-y-6">
          <div>
            <p className="hidden md:block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">
              Workspace
            </p>
            <nav className="space-y-1">
              <NavLink
                to="/convert"
                onClick={onClose}
                className={({ isActive }) =>
                  `w-full flex items-center space-x-3 px-3 py-2.5 rounded text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-800 text-slate-100"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`
                }
              >
                <FileCode className="w-4.5 h-4.5" />
                <span>Convert Files</span>
              </NavLink>

              <NavLink
                to="/library"
                onClick={onClose}
                className={({ isActive }) =>
                  `w-full flex items-center space-x-3 px-3 py-2.5 rounded text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-800 text-slate-100"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`
                }
              >
                <History className="w-4.5 h-4.5" />
                <span>My Library</span>
              </NavLink>

            </nav>
          </div>

          <div className="pt-4 border-t border-slate-800/60">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">
              Direct Editors
            </p>
            <nav className="space-y-1">
              <NavLink
                to="/editor/html"
                onClick={onClose}
                className={({ isActive }) =>
                  `w-full flex items-center space-x-3 px-3 py-2.5 rounded text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-800 text-slate-100"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`
                }
              >
                <Code className="w-4.5 h-4.5" />
                <span>HTML Editor</span>
              </NavLink>

              <NavLink
                to="/editor/markdown"
                onClick={onClose}
                className={({ isActive }) =>
                  `w-full flex items-center space-x-3 px-3 py-2.5 rounded text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-800 text-slate-100"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`
                }
              >
                <FileSignature className="w-4.5 h-4.5" />
                <span>Markdown Editor</span>
              </NavLink>

              <NavLink
                to="/editor/mermaid"
                onClick={onClose}
                className={({ isActive }) =>
                  `w-full flex items-center space-x-3 px-3 py-2.5 rounded text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-800 text-slate-100"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`
                }
              >
                <GitFork className="w-4.5 h-4.5" />
                <span>Mermaid Editor</span>
              </NavLink>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile profile footer (hidden on desktop) */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 md:hidden">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 px-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-300">
                {user.username?.substring(0, 2).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-slate-300 truncate">
                  {user.fullName || user.username}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onLogOut();
                onClose?.();
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              onOpenLogin();
              onClose?.();
            }}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded text-xs font-medium transition"
          >
            <User className="w-4 h-4" />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </aside>
  );
}
