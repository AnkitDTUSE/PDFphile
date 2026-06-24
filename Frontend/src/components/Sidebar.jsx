import { NavLink } from "react-router-dom";
import { FileCode, History, LogOut, User } from "lucide-react";

export default function Sidebar({ user, onLogOut, onOpenLogin }) {
  return (
    <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col justify-between h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-7 h-7 rounded bg-neutral-100 flex items-center justify-center">
            <span className="text-neutral-950 font-bold text-sm">P</span>
          </div>
          <span className="font-semibold tracking-tight text-neutral-200">PDFphile</span>
        </div>

        <nav className="space-y-1">
          <NavLink
            to="/convert"
            className={({ isActive }) =>
              `w-full flex items-center space-x-3 px-3 py-2.5 rounded text-sm font-medium transition ${
                isActive
                  ? "bg-neutral-800 text-neutral-100"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850"
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
                  ? "bg-neutral-800 text-neutral-100"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850"
              }`
            }
          >
            <History className="w-4.5 h-4.5" />
            <span>My Library</span>
          </NavLink>
        </nav>
      </div>

      <div className="p-4 border-t border-neutral-800 bg-neutral-900/50">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 px-2">
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold text-neutral-300">
                {user.username?.substring(0, 2).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-neutral-300 truncate">
                  {user.fullName || user.username}
                </p>
                <p className="text-[10px] text-neutral-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={onLogOut}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded text-xs font-medium text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded text-xs font-medium transition"
          >
            <User className="w-4 h-4" />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </aside>
  );
}
