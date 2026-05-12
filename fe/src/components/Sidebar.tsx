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
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
    ],
  },
  {
    group: "Transaksi VCF",
    items: [
      {
        href: "/vcf/list",
        label: "Daftar VCF",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="M9 12h6M9 16h4" />
          </svg>
        ),
      },
    ],
  },
  {
    group: "Master Data",
    items: [
      {
        href: "/master/transporters",
        label: "Transporter",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13" rx="1" />
            <path d="M16 8h4l3 3v5h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        ),
      },
      {
        href: "/master/drivers",
        label: "Supir",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ),
      },
      {
        href: "/master/produk",
        label: "Produk",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        ),
      },
      {
        href: "/master/muatan-dibawa",
        label: "Muatan Dibawa",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        ),
      },
      {
        href: "/master/muatan-diisi",
        label: "Muatan Diisi",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v12" />
            <polyline points="7 10 12 15 17 10" />
            <path d="M20 21H4" />
          </svg>
        ),
      },
      {
        href: "/master/checklist",
        label: "Checklist Supir",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <polyline points="16 11 18 13 22 9" />
          </svg>
        ),
      },
      {
        href: "/master/pemeriksaan-masuk",
        label: "Checklist Masuk",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        ),
      },
      {
        href: "/master/pemeriksaan-keluar",
        label: "Checklist Keluar",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        ),
      },
      {
        href: "/master/vehicles",
        label: "Jenis Kendaraan",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-3" />
            <circle cx="7.5" cy="17.5" r="2.5" />
            <circle cx="17.5" cy="17.5" r="2.5" />
          </svg>
        ),
      },
      {
        href: "/master/users",
        label: "Pengguna",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
      {
        href: "/settings",
        label: "Pengaturan",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m20.5-4.5L16 12m-6 0L3.5 7.5M20.5 16.5L16 12" />
          </svg>
        ),
        adminOnly: true,
      },
    ],
  },
];

const OFFICER_NAV = [
  {
    group: "Operasional",
    items: [
      {
        href: "/vcf",
        label: "VCF",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
      {
        href: "/vcf/list",
        label: "Daftar VCF",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="M9 12h6M9 16h4" />
          </svg>
        ),
      }
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
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


  useEffect(() => {
    const u = getUser();
    setUser(u);
  }, []);

  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      clearSession();
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
      router.push("/login");
    }
  };


  const navItems = isAdmin() ? ADMIN_NAV : OFFICER_NAV;

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`flex flex-col transition-all duration-300 h-full`}
        style={{
          width: collapsed ? 64 : 256,
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <div
          className="flex items-center gap-3 px-4 py-5 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex-shrink-0 flex items-center justify-center p-1 rounded-lg shadow-sm" style={{ width: 40 }}>
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-bold text-sm leading-tight" style={{ color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                VCF System
              </p>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                PT. INL
              </p>
            </div>
          )}

          {!isMobile && (
            <button
              id="btn-toggle-sidebar"
              className="ml-auto flex-shrink-0 p-1 rounded"
              style={{ color: "var(--text-muted)" }}
              onClick={() => setCollapsed(!collapsed)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {collapsed ? (
                  <path d="M9 18l6-6-6-6" />
                ) : (
                  <path d="M15 18l-6-6 6-6" />
                )}
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {navItems.map((group) => (
            <div key={group.group} className="mb-2">
              {!collapsed && (
                <p
                  className="px-3 mb-1"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}
                >
                  {group.group}
                </p>
              )}
              {group.items.map((item) => {
                const isActive = item.href === "/vcf"
                  ? pathname === "/vcf"
                  : item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                const isNavigating = navigatingTo === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    id={`nav-${item.href.replace(/\//g, "-").replace(/^-/, "")}`}
                    className={`nav-item mb-0.5 ${isActive ? "active" : ""} ${isNavigating ? "opacity-70" : ""}`}
                    title={collapsed ? item.label : undefined}
                    style={collapsed ? { justifyContent: "center", padding: "10px" } : {}}
                    onClick={() => {
                      if (!isActive) setNavigatingTo(item.href);
                    }}
                  >
                    {isNavigating ? (
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
          ))}
        </nav>

        {/* User info & logout */}
        <div
          className="flex-shrink-0 px-2 py-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {!collapsed && user && (
            <div className="px-3 py-2 mb-2 rounded-lg" style={{ background: "rgba(0,0,0,0.02)" }}>
              <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                {user.nama}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)", textTransform: "capitalize" }}>
                {user.role === "admin" ? "Administrator" : "Petugas Keamanan"}
              </p>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="nav-item w-full mb-1"
            style={collapsed ? { justifyContent: "center", padding: "10px" } : {}}
            title={theme === "light" ? "Ganti ke Mode Gelap" : "Ganti ke Mode Terang"}
          >
            {theme === "light" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
            {!collapsed && <span>{theme === "light" ? "Mode Gelap" : "Mode Terang"}</span>}
          </button>

          <button
            id="btn-logout"
            className="nav-item w-full"
            style={collapsed ? { justifyContent: "center", padding: "10px" } : {}}
            onClick={() => setIsLogoutModalOpen(true)}
            title="Logout"

          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        loading={isLoggingOut}
      />
    </>

  );
}
