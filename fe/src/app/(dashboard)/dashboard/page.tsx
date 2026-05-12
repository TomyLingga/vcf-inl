"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { vcfApi } from "@/lib/api";
import { getUser, isAdmin } from "@/lib/auth";
import { getStatusLabel, getStatusColor } from "@/lib/utils";

interface VcfSummary {
  id: number;
  nomor_urut: string;
  no_polisi: string;
  status: string;
  tipe_kegiatan: string;
  tanggal: string;
  transporter?: { nama_transporter: string };
  driver?: { nama_supir: string };
}

const getActionLabel = (status: string) => {
  const map: Record<string, string> = {
    bagian1_selesai: "Isi Bagian 2",
    bagian2_selesai: "Isi Bagian 3",
    loading_unloading_proses: "Lihat Operasional",
    loading_unloading_selesai: "Isi Bagian 3",
    bagian3_selesai: "Isi Bagian 4",
    selesai: "Lihat Detail",
    ditolak: "Lihat Detail",
    reject: "Lihat Detail",
  };
  return map[status] ?? "Detail";
};

interface Stats {
  total: number;
  aktif: number;
  selesai: number;
  hari_ini: number;
}

// Skeleton Components
function StatsCardSkeleton() {
  return (
    <div className="stat-card">
      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
      <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr>
      <td><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
      <td><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
      <td><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
      <td><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
      <td><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
      <td><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
      <td><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
      <td><div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
    </tr>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const user = getUser();
  const [vcfs, setVcfs] = useState<VcfSummary[]>([]);
  const [filteredVcfs, setFilteredVcfs] = useState<VcfSummary[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, aktif: 0, selesai: 0, hari_ini: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch dashboard data - all VCFs for today to calculate stats correctly
  const fetchData = useCallback(async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Fetch all VCFs for today to calculate stats
      const res = await vcfApi.getList({ 
        tanggal: today, 
        per_page: 100 
      });

      const allData: VcfSummary[] = res.data.data || res.data || [];
      
      // Calculate stats correctly
      const aktif = allData.filter(v => v.status !== 'selesai' && v.status !== 'reject' && v.status !== 'ditolak').length;
      const selesai = allData.filter(v => v.status === 'selesai').length;
      const hari_ini = allData.filter(v => v.tanggal === today).length;
      
      // For display, show active VCFs (not completed/rejected)
      const activeData = allData.filter(v => v.status !== 'selesai' && v.status !== 'reject' && v.status !== 'ditolak');

      setStats({
        total: allData.length,
        aktif,
        selesai,
        hari_ini
      });
      setVcfs(activeData);
      setFilteredVcfs(activeData);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVcfs(vcfs);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = vcfs.filter(
      (vcf) =>
        vcf.no_polisi?.toLowerCase().includes(query) ||
        vcf.driver?.nama_supir?.toLowerCase().includes(query) ||
        vcf.nomor_urut?.toLowerCase().includes(query)
    );
    setFilteredVcfs(filtered);
  }, [searchQuery, vcfs]);


  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Selamat Pagi" : now.getHours() < 17 ? "Selamat Siang" : "Selamat Sore";

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">
            {greeting}, {user?.nama?.split(" ")[0] || "Pengguna"} 👋
          </h1>
          <p className="page-subtitle">
            {isAdmin() ? "Admin Dashboard · PT. Industri Nabati Lestari" : "Security Officer · Main Gate"}
          </p>
        </div>
        <Link href="/vcf/register" id="btn-new-vcf" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8M8 12h8" />
          </svg>
          Registrasi VCF Baru
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <div className="stat-card blue">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                Total VCF
              </p>
              <p className="text-3xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {stats.total}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Semua record</p>
            </div>
            <div className="stat-card amber">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                Aktif
              </p>
              <p className="text-3xl font-bold" style={{ color: "#f59e0b", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {stats.aktif}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Kendaraan di area</p>
            </div>
            <div className="stat-card green">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                Selesai
              </p>
              <p className="text-3xl font-bold" style={{ color: "#10b981", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {stats.selesai}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Main gate keluar</p>
            </div>
            <div className="stat-card purple">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                Hari Ini
              </p>
              <p className="text-3xl font-bold" style={{ color: "#8b5cf6", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {stats.hari_ini}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Kendaraan masuk</p>
            </div>
          </>
        )}
      </div>

      {/* Active VCF Table */}
      <div className="glass-card overflow-hidden">
        <div
          className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 gap-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              VCF Aktif — Kendaraan di Area
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Auto-refresh setiap 30 detik · {loading ? "Memuat..." : `${filteredVcfs.length} dari ${vcfs.length} record`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari no polisi/supir..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input text-sm py-2 px-3 pr-8"
                style={{ minWidth: "200px" }}
              />
              <svg
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: "var(--text-muted)" }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <div
              className="w-2 h-2 rounded-full pulse-glow"
              style={{ background: "#10b981" }}
            />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Live</span>
            <Link href="/vcf" className="btn btn-secondary btn-sm">
              Lihat Semua
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>No. Urut</th>
                  <th>No. Polisi</th>
                  <th>Supir</th>
                  <th>Transporter</th>
                  <th>Tipe</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => <TableRowSkeleton key={i} />)}
              </tbody>
            </table>
          ) : filteredVcfs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16" style={{ color: "var(--text-muted)" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-40">
                <rect x="1" y="3" width="15" height="13" rx="1" />
                <path d="M16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <p className="text-sm">
                {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada kendaraan aktif"}
              </p>
              <Link href="/vcf/register" className="btn btn-primary btn-sm mt-4">
                Registrasi Kendaraan Baru
              </Link>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>No. Urut</th>
                  <th>No. Polisi</th>
                  <th>Supir</th>
                  <th>Transporter</th>
                  <th>Tipe</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredVcfs.map((vcf) => (
                  <tr key={vcf.id}>
                    <td>
                      <span className="font-mono font-semibold text-sm" style={{ color: "#a78bfa" }}>
                        {vcf.nomor_urut}
                      </span>
                    </td>
                    <td>
                      <span className="font-semibold">{vcf.no_polisi}</span>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {vcf.driver?.nama_supir || "—"}
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {vcf.transporter?.nama_transporter || "—"}
                    </td>
                    <td>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded"
                        style={{
                          background: vcf.tipe_kegiatan?.includes("loading")
                            ? "rgba(139,92,246,0.15)"
                            : "rgba(16,185,129,0.15)",
                          color: vcf.tipe_kegiatan?.includes("loading") ? "#a78bfa" : "#34d399",
                        }}
                      >
                        {vcf.tipe_kegiatan?.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusColor(vcf.status)}`}>
                        {getStatusLabel(vcf.status)}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                      {vcf.tanggal}
                    </td>
                    <td>
                      <Link
                        href={`/vcf/${vcf.id}`}
                        className={`btn btn-sm ${
                          vcf.status === "selesai" || vcf.status === "reject" ? "btn-secondary" : "btn-primary"
                        }`}
                        id={`btn-detail-${vcf.id}`}
                      >
                        {getActionLabel(vcf.status)}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick actions for officer */}
      {!isAdmin() && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[
            {
              href: "/vcf/register",
              label: "Main Gate Masuk",
              desc: "Registrasi kendaraan baru",
              color: "#8b5cf6",
              icon: "M12 8v8M8 12h8",
              stage: "Bagian 1",
            },
            {
              href: "/vcf?stage=bagian1_selesai",
              label: "Weighbridge Masuk",
              desc: "Pemeriksaan masuk jembatan",
              color: "#f59e0b",
              icon: "M3 6h18M3 12h18M3 18h18",
              stage: "Bagian 2",
            },
            {
              href: "/vcf?stage=loading_unloading_selesai",
              label: "Weighbridge Keluar",
              desc: "Pemeriksaan keluar jembatan",
              color: "#8b5cf6",
              icon: "M17 13l-5 5-5-5M17 6l-5 5-5-5",
              stage: "Bagian 3",
            },
            {
              href: "/vcf?stage=bagian3_selesai",
              label: "Main Gate Keluar",
              desc: "Penutupan & pencatatan keluar",
              color: "#10b981",
              icon: "M5 12h14M12 5l7 7-7 7",
              stage: "Bagian 4",
            },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              id={`quick-action-${action.stage.toLowerCase().replace(" ", "-")}`}
              className="glass-card glass-card-hover p-5 block"
            >
              <div
                className="mb-3 flex items-center justify-center font-black"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `${action.color}20`,
                  color: action.color,
                }}
              >
                {action.stage.split(" ")[1]}
              </div>
              <p className="text-xs font-bold uppercase mb-1" style={{ color: action.color, letterSpacing: "0.5px" }}>
                {action.stage}
              </p>
              <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                {action.label}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {action.desc}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
