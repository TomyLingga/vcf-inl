"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getUser, clearSession, isAdmin } from "@/lib/auth";
import { authApi } from "@/lib/api";
import { useTheme } from "./ThemeProvider";
import LogoutConfirmModal from "./LogoutConfirmModal";

const ADMIN_NAV = [
  {
    group: "Utama",
    collapsible: false,
    items: [
      {
        href: "/dashboard", label: "Dashboard",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
      },
    ],
  },
  {
    group: "Operasional VCF",
    collapsible: true,
    items: [
      {
        href: "/vcf/list", label: "Daftar VCF",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>,
      },
      {
        href: "/vcf", label: "Input VCF",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      },
    ],
  },
  {
    group: "Master Data",
    collapsible: true,
    items: [
      { href: "/master/transporters", label: "Transporter", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
      { href: "/master/drivers", label: "Supir", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
      { href: "/master/produk", label: "Produk", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> },
      { href: "/master/muatan-dibawa", label: "Muatan Dibawa", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> },
      { href: "/master/muatan-diisi", label: "Muatan Diisi", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12"/><polyline points="7 10 12 15 17 10"/><path d="M20 21H4"/></svg> },
      { href: "/master/checklist", label: "Checklist Supir", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg> },
      { href: "/master/pemeriksaan-masuk", label: "Checklist Masuk", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> },
      { href: "/master/pemeriksaan-keluar", label: "Checklist Keluar", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> },
      { href: "/master/vehicles", label: "Jenis Kendaraan", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg> },
      { href: "/master/users", label: "Pengguna", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
      { href: "/settings", label: "Pengaturan", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/></svg>, adminOnly: true },
    ],
  },
];

const OFFICER_NAV = [
  {
    group: "Operasional",
    collapsible: false,
    items: [
      { href: "/vcf", label: "VCF", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
      { href: "/vcf/list", label: "Daftar VCF", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg> },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  isMobile?: boolean;
}

export default function Sidebar({ collapsed, setCollapsed, isMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ nama: string; role: string } | null>(null);
  const { theme, toggleTheme } = useTheme();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try { return JSON.parse(localStorage.getItem("sidebar-open-groups") || "{}"); } catch { return {}; }
    }
    return {};
  });

  useEffect(() => { setUser(getUser()); }, []);
  useEffect(() => { setNavigatingTo(null); }, [pathname]);

  const toggleGroup = (g: string) => {
    setOpenGroups(prev => {
      const next = { ...prev, [g]: !prev[g] };
      if (typeof window !== "undefined") localStorage.setItem("sidebar-open-groups", JSON.stringify(next));
      return next;
    });
  };

  const isGroupOpen = (g: string) => openGroups[g] !== false; // default open

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try { await authApi.logout(); } catch { /* ignore */ } finally {
      clearSession(); setIsLoggingOut(false); setIsLogoutModalOpen(false); router.push("/login");
    }
  };

  const navItems = isAdmin() ? ADMIN_NAV : OFFICER_NAV;

  // Liquid glass sidebar style
  const sidebarStyle: React.CSSProperties = {
    width: collapsed ? 64 : 256,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
    background: theme === "dark"
      ? "linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(9,18,38,0.96) 100%)"
      : "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(241,245,249,0.92) 100%)",
    backdropFilter: "blur(24px) saturate(180%)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
    borderRight: theme === "dark"
      ? "1px solid rgba(255,255,255,0.08)"
      : "1px solid rgba(0,0,0,0.1)",
    boxShadow: theme === "dark"
      ? "4px 0 32px rgba(0,0,0,0.4), inset -1px 0 0 rgba(255,255,255,0.05)"
      : "4px 0 24px rgba(0,0,0,0.08), inset -1px 0 0 rgba(255,255,255,0.8)",
  };

  return (
    <>
      <aside style={sidebarStyle}>
        {/* Shimmer top bar */}
        <div style={{
          height: 2,
          background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.6), rgba(59,130,246,0.6), transparent)",
          flexShrink: 0,
        }} />

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "16px 12px", flexShrink: 0,
          borderBottom: theme === "dark" ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
          background: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.6)",
        }}>
          <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", border: "1.5px solid rgba(34,197,94,0.3)", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src="/logo.svg" alt="VCF" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden", flex: 1 }}>
              <p style={{ fontWeight: 800, fontSize: 14, color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: "-0.3px" }}>VCF System</p>
              <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>PT. INL • {theme === "dark" ? "🌙" : "☀️"}</p>
            </div>
          )}
          {!isMobile && (
            <button
              id="btn-toggle-sidebar"
              onClick={() => setCollapsed(!collapsed)}
              style={{
                marginLeft: collapsed ? "auto" : 0,
                width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                background: theme === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
                border: theme === "dark" ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
                cursor: "pointer", color: "var(--text-muted)", transition: "all 0.2s",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                {collapsed ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
              </svg>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
          {navItems.map((group) => {
            const open = isGroupOpen(group.group);
            const hasActive = group.items.some(item =>
              item.href === "/vcf" ? pathname === "/vcf" : item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href)
            );

            return (
              <div key={group.group} style={{ marginBottom: 4 }}>
                {/* Group header row */}
                {!collapsed && (
                  <div
                    onClick={group.collapsible ? () => toggleGroup(group.group) : undefined}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "6px 10px", marginBottom: 2, borderRadius: 8,
                      cursor: group.collapsible ? "pointer" : "default",
                      userSelect: "none",
                      background: group.collapsible
                        ? (theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)")
                        : "transparent",
                      border: group.collapsible
                        ? (theme === "dark" ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)")
                        : "1px solid transparent",
                      transition: "all 0.2s",
                    }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                      {group.group}
                      {hasActive && group.collapsible && !open && (
                        <span style={{ marginLeft: 6, width: 6, height: 6, borderRadius: "50%", background: "var(--accent-primary)", display: "inline-block", verticalAlign: "middle" }} />
                      )}
                    </span>
                    {group.collapsible && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        style={{ color: "var(--text-muted)", transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.25s" }}>
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    )}
                  </div>
                )}

                {/* Items */}
                <div style={{
                  overflow: "hidden",
                  maxHeight: (collapsed || open) ? "9999px" : "0px",
                  opacity: (collapsed || open) ? 1 : 0,
                  transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.25s",
                }}>
                  {group.items.map((item) => {
                    const isActive = item.href === "/vcf"
                      ? pathname === "/vcf"
                      : item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(item.href);
                    const isNav = navigatingTo === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        id={`nav-${item.href.replace(/\//g, "-").replace(/^-/, "")}`}
                        title={collapsed ? item.label : undefined}
                        onClick={() => { if (!isActive) setNavigatingTo(item.href); }}
                        className={`nav-item mb-0.5 ${isActive ? "active" : ""} ${isNav ? "opacity-70" : ""}`}
                        style={collapsed ? { justifyContent: "center", padding: "10px" } : {}}
                      >
                        {isNav ? (
                          <svg className="animate-spin flex-shrink-0" width="16" height="16" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : item.icon}
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{
          flexShrink: 0, padding: "10px 8px",
          borderTop: theme === "dark" ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
          background: theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.5)",
        }}>
          {!collapsed && user && (
            <div style={{
              padding: "10px 12px", marginBottom: 8, borderRadius: 10,
              background: theme === "dark" ? "rgba(34,197,94,0.08)" : "rgba(34,197,94,0.07)",
              border: "1px solid rgba(34,197,94,0.2)",
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>👤 {user.nama}</p>
              <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2, textTransform: "capitalize" }}>
                {user.role === "admin" ? "🔑 Administrator" : "🛡️ Petugas Keamanan"}
              </p>
            </div>
          )}

          <button onClick={toggleTheme} className="nav-item w-full mb-1"
            style={collapsed ? { justifyContent: "center", padding: "10px" } : {}}
            title={theme === "light" ? "Mode Gelap" : "Mode Terang"}>
            {theme === "light"
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>}
            {!collapsed && <span>{theme === "light" ? "Mode Gelap" : "Mode Terang"}</span>}
          </button>

          <button id="btn-logout" className="nav-item w-full" onClick={() => setIsLogoutModalOpen(true)}
            style={collapsed ? { justifyContent: "center", padding: "10px" } : {}} title="Keluar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      <LogoutConfirmModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={handleLogout} loading={isLoggingOut} />
    </>
  );
}
