"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { isAuthenticated } from "@/lib/auth";
import { useTheme } from "@/components/ThemeProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const checkAuth = useCallback(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      setChecking(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024; // Use 1024 for more safe mobile/tablet trigger
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-close mobile menu on route change
  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [pathname, isMobile]);

  if (checking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  const sidebarWidth = sidebarCollapsed ? 64 : 256;

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-primary)" }}>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-30"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Wrapper */}
      <div
        className="fixed inset-y-0 left-0 z-40"
        style={{
          transform: isMobile ? (mobileOpen ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          width: isMobile ? 280 : sidebarWidth,
        }}
      >
        <Sidebar
          collapsed={isMobile ? false : sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          isMobile={isMobile}
        />

        {/* Mobile Close Button */}
        {isMobile && mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 -right-12 p-2 rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Main content */}
      <main
        className="flex-1 h-screen overflow-hidden flex flex-col"
        style={{
          marginLeft: isMobile ? 0 : sidebarWidth,
          transition: "margin-left 0.3s ease",
          background: "var(--bg-primary)",
        }}
      >
        {/* Mobile top bar */}
        {isMobile && (
          <div
            className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3"
            style={{
              background: "var(--bg-secondary)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <button
              id="btn-mobile-menu"
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg"
              style={{ color: "var(--text-secondary)", background: "rgba(255,255,255,0.06)" }}
              aria-label="Open menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
              }}
            >
              <svg width="23" height="23" viewBox="0 0 25 25" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-black dark:text-white">
                <rect x="1" y="3" width="15" height="13" rx="1" />
                <path d="M16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <span
              className="font-bold text-sm"
              style={{ color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              VCF System
            </span>

            <button
              onClick={toggleTheme}
              className="ml-auto p-2 rounded-lg"
              style={{ color: "var(--text-secondary)", background: "rgba(255,255,255,0.06)" }}
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            </button>
          </div>
        )}

        <div className="p-4 lg:p-8 w-full flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
