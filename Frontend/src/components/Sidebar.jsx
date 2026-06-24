import { NavLink } from "react-router-dom";
import { FileCode, History, LogOut, User } from "lucide-react";
import Logo from "../assets/logo.png";

export default function Sidebar({ user, onLogOut, onOpenLogin }) {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 flex items-center justify-center rounded-md">
            <img src={Logo} alt="PDFphile Logo" className="w-full h-full object-contain rounded-md" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-100">PDFphile</span>
        </div>

        <nav className="space-y-1">
          <NavLink
            to="/convert"
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

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
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
              onClick={onLogOut}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
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
