import { Clock3, Languages, Mic2 } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f5f7f5] text-[#10211f]">
      <header className="border-b border-[#dce5e1] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0c6b5d] text-white shadow-sm">
              <Languages size={21} />
            </span>
            <span>
              <strong className="block text-lg leading-none tracking-[-0.03em]">Fassara</strong>
              <small className="mt-1 block text-xs text-[#677773]">Hausa & English Speech</small>
            </span>
          </NavLink>

          <nav className="flex items-center gap-1 rounded-xl bg-[#f0f4f2] p-1">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}>
              <Mic2 size={16} /> <span>Translate</span>
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}>
              <Clock3 size={16} /> <span>History</span>
            </NavLink>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
