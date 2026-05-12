"use client";

import { useState, useEffect, useCallback, Suspense, lazy } from "react";
import { useParams, useRouter } from "next/navigation";
import { vcfApi } from "@/lib/api";
import { getStatusLabel, getStatusColor } from "@/lib/utils";
import { exportToPDF, exportToDocx } from "@/lib/exportUtils";

// Lazy load heavy components for better performance
const Bagian2Form = lazy(() => import("./Bagian2Form"));
const Bagian3Form = lazy(() => import("./Bagian3Form"));
const Bagian4Form = lazy(() => import("./Bagian4Form"));
const PrintVCF = lazy(() => import("./PrintVCF"));

// Form loading skeleton
function FormSkeleton() {
  return (
    <div className="glass-card p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="spinner-accent" style={{ width: 22, height: 22 }} />
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Memuat formulir...</span>
      </div>
      <div className="animate-pulse space-y-4">
        <div className="h-5 w-44 rounded-lg" style={{ background: "var(--border)" }} />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 rounded-lg" style={{ background: "var(--border)" }} />
          <div className="h-10 rounded-lg" style={{ background: "var(--border)" }} />
        </div>
        <div className="h-10 rounded-lg" style={{ background: "var(--border)" }} />
        <div className="h-5 w-36 rounded-lg" style={{ background: "var(--border)" }} />
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3].map(i => <div key={i} className="h-14 rounded-xl" style={{ background: "var(--border)" }} />)}
        </div>
        <div className="h-20 rounded-lg" style={{ background: "var(--border)" }} />
      </div>
    </div>
  );
}

interface VcfDetail {
  id: number;
  nomor_urut: string;
  tanggal: string;
  created_at?: string;
  status: string;
  tipe_kegiatan: string;
  asal_tujuan: string;
  no_polisi: string;
  jam_masuk: string;
  produk?: string;
  tipe_kendaraan?: string;
  tahun_kendaraan?: number;
  transporter?: { nama_transporter: string };
  driver?: { nama_supir: string; no_sim: string; jenis_sim?: string };
  kelengkapan_supir?: { id: number; item_id: number; nilai: any; keterangan?: string; item: { nama_item: string } }[];
  pemeriksaan_masuk?: { id: number; item_id: number; nilai: string; keterangan?: string; item: { nama_item: string }; petugas?: { nama: string }; waktu_input?: string; created_at?: string }[];
  pemeriksaan_keluar?: { id: number; item_id: number; nilai: string; keterangan?: string; item: { nama_item: string }; petugas?: { nama: string }; waktu_input?: string; created_at?: string }[];
  beban_tambahan_masuk?: { jenis_beban: string; ada: boolean };
  beban_tambahan_keluar?: { jenis_beban: string; ada: boolean };
  segel_masuk?: { jumlah_segel: number; kondisi?: string; nomor_segel: { nomor_segel: string }[]; petugas?: { nama: string }; waktu_input?: string; created_at?: string };
  segel_keluar?: { jumlah_segel: number; kondisi?: string; nomor_segel: { nomor_segel: string }[]; petugas?: { nama: string }; waktu_input?: string; created_at?: string };
  vcf_keluar?: { jam_keluar: string; emergency_respon_kontak: string; keterangan?: string; petugas?: { nama: string }; waktu_input?: string; created_at?: string };
  vcf_bagian2?: { keterangan?: string };
  vcf_bagian3?: { keterangan?: string };
  catatan?: string;
  jenis_kendaraan_id?: number;
  jenis_kendaraan?: { id: number; nama: string };
  muatan_dibawa?: { item_muatan_id?: number; item_muatan?: { id: number; nama_item?: string }; nama_item?: string; nilai?: string }[];
  muatan_diisi?: { item_muatan_id?: number; item_muatan?: { id: number; nama_item?: string }; nama_item?: string; nilai?: string }[];
  created_by?: { id: number; nama: string };
  nama_petugas_main_gate_masuk?: string;
  nama_petugas_wb_masuk?: string;
  nama_petugas_wb_keluar?: string;
  nama_petugas_main_gate_keluar?: string;
}

const STEPS = [
  { key: "pendaftaran", label: "Pendaftaran", n: 1 },
  { key: "bagian1_selesai", label: "Weighbridge Masuk", n: 2 },
  { key: "bagian2_selesai", label: "Weighbridge Keluar", n: 3 },
  { key: "loading_unloading_proses", label: "Weighbridge Keluar", n: 3 },
  { key: "loading_unloading_selesai", label: "Weighbridge Keluar", n: 3 },
  { key: "bagian3_selesai", label: "Main Gate Keluar", n: 4 },
  { key: "selesai", label: "Selesai", n: 4 },
];

function getStepNumber(vcf: VcfDetail | null): number {
  if (!vcf) return 1;
  if (vcf.status === "reject") {
    if (vcf.catatan?.includes("[REJECTED AT WB KELUAR]")) return 3;
    if (vcf.catatan?.includes("[REJECTED AT WB MASUK]")) return 2;
    // Default to 1 if no marker or rejected at stage 1
    return 1;
  }
  const step = STEPS.find((s) => s.key === vcf.status);
  return step?.n || 1;
}

export default function VcfDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vcfId = Number(params.id);

  const [vcf, setVcf] = useState<VcfDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "bagian2" | "bagian3" | "bagian4" | "reject_detail">("info");
  const [hasInitializedTab, setHasInitializedTab] = useState(false);
  const [showPrint, setShowPrint] = useState(false);

  const fetchVcf = useCallback(async () => {
    try {
      const res = await vcfApi.getDetail(vcfId);
      const data = res.data;
      setVcf(data);

      // Auto-set tab based on status only once on initial load
      if (!hasInitializedTab) {
        if (data.status === "bagian1_selesai") {
          setActiveTab("bagian2");
        } else if (["bagian2_selesai", "loading_unloading_selesai"].includes(data.status)) {
          setActiveTab("bagian3");
        } else if (data.status === "bagian3_selesai") {
          setActiveTab("bagian4");
        }
        setHasInitializedTab(true);
      }
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  }, [vcfId]);

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!vcf) return;
    
    const headers = ["Item", "Detail"];
    const data = [
      ["No. Urut", vcf.nomor_urut],
      ["Tanggal", vcf.tanggal],
      ["Jam Masuk", vcf.jam_masuk + " WIB"],
      ["No. Polisi", vcf.no_polisi],
      ["Supir", vcf.driver?.nama_supir || "-"],
      ["Transporter", vcf.transporter?.nama_transporter || "-"],
      ["Produk", vcf.produk || "-"],
      ["Status", getStatusLabel(vcf.status)]
    ];

    const title = `VEHICLE CONTROL FORM - ${vcf.nomor_urut}`;
    const filename = `vcf_detail_${vcf.nomor_urut}_${new Date().toISOString().split('T')[0]}`;

    if (format === 'pdf') await exportToPDF(filename, title, headers, data);
    else await exportToDocx(filename, title, headers, data);
  };

  const handleFinalize = async () => {
    if (!confirm("Konfirmasi kendaraan keluar dari Main Gate? Status VCF akan menjadi SELESAI.")) return;
    try {
      setLoading(true);
      await vcfApi.finalizeVcf(vcf!.id);
      fetchVcf();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal memproses keluar Main Gate.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVcf();
  }, [fetchVcf]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="spinner" style={{ width: 32, height: 32 }} />
        <span className="ml-3" style={{ color: "var(--text-muted)" }}>Memuat data VCF...</span>
      </div>
    );
  }

  if (!vcf) {
    return (
      <div className="flex flex-col items-center justify-center py-32" style={{ color: "var(--text-muted)" }}>
        <p>Data VCF tidak ditemukan.</p>
        <button className="btn btn-primary mt-4" onClick={() => router.push("/vcf")}>
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  const currentStep = getStepNumber(vcf);
  const isDone = vcf.status === "selesai";
  const isRejected = vcf.status === "reject";
  const canEditRegistrasi = !isDone && !isRejected;

  const canFillBagian2 = vcf.status === "bagian1_selesai";
  const canFillBagian3 = ["bagian2_selesai", "loading_unloading_selesai"].includes(vcf.status);
  const canFillBagian4 = ["bagian3_selesai", "weighbridge_keluar"].includes(vcf.status);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          title="Kembali"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="page-title font-mono">VCF #{vcf.nomor_urut}</h1>
            <span 
              className={`status-badge ${getStatusColor(vcf.status)}`}
              style={isRejected ? { background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" } : {}}
            >
              {isRejected ? "Ditolak" : getStatusLabel(vcf.status)}
            </span>
          </div>
          <p className="page-subtitle">
            {vcf.no_polisi} · {vcf.driver?.nama_supir} · {vcf.tanggal}
          </p>
        </div>
        {isDone && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <span className="text-[10px] font-black uppercase tracking-widest">COMPLETED</span>
          </div>
        )}
        {isRejected && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
            <span className="text-[10px] font-black uppercase tracking-widest">REJECTED</span>
          </div>
        )}

        {/* Action Buttons (Only show Print on Info tab) */}
        {activeTab === "info" && (
          <div className="flex bg-bg-card border border-border rounded-lg p-1 ml-4 shadow-sm">
            <button
              onClick={() => setShowPrint(true)}
              className="px-4 py-2 hover:bg-blue-500/10 rounded-lg font-bold text-xs flex items-center gap-2 transition-all"
              style={{ color: "#60a5fa" }}
              title="Cetak Formulir VCF"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              CETAK FORMULIR
            </button>
          </div>
        )}

        {/* Finalize logic now moved to Bagian4Form */}
        
      </div>

      {/* Progress steps */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center">
          {[
            { n: 1, label: "Main Gate\nMasuk" },
            { n: 2, label: "Weighbridge\nMasuk" },
            { n: 3, label: "Weighbridge\nKeluar" },
            { n: 4, label: "Main Gate\nKeluar" },
          ].map((step, idx) => (
            <div key={step.n} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className="step-circle"
                  style={
                    step.n < currentStep || isDone
                      ? { borderColor: "#10b981", background: "rgba(16,185,129,0.2)", color: "#10b981" }
                      : step.n === currentStep
                      ? (isRejected 
                        ? { borderColor: "#ef4444", background: "rgba(239,68,68,0.2)", color: "#f87171" }
                        : { borderColor: "#3b82f6", background: "rgba(59,130,246,0.2)", color: "#60a5fa" })
                      : {}
                  }
                >
                  {step.n < currentStep || isDone ? "●" : (isRejected && step.n === currentStep) ? "×" : step.n}
                </div>
                <span className="text-xs mt-1 text-center whitespace-pre-line" style={{ color: step.n <= currentStep ? "var(--text-secondary)" : "var(--text-muted)", lineHeight: 1.2 }}>
                  {step.label}
                </span>
              </div>
              {idx < 3 && (
                <div
                  className="flex-1 h-px mx-2"
                  style={{ background: step.n < currentStep ? "#10b981" : "var(--border-light)" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
        
        {/* Baner reject */}
      {isRejected && (
        <div className="mb-6 rounded-xl border border-red-200 dark:border-red-900/40 overflow-hidden">

          <div className="flex items-start gap-4 px-5 py-4 bg-red-50 dark:bg-red-950/20">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-white/5 border border-red-200 dark:border-red-800/40 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">VCF Ditolak</p>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white dark:bg-white/5 text-red-500 border border-red-200 dark:border-red-800/40">
                  {currentStep === 2 ? "Weighbridge Masuk" : currentStep === 3 ? "Weighbridge Keluar" : "Pendaftaran"}
                </span>
              </div>
              <p className="text-xs text-red-400 dark:text-red-500 leading-relaxed truncate">
                {vcf.catatan || "Alasan penolakan tidak tersedia."}
              </p>
            </div>

            <button
              onClick={() => setActiveTab("reject_detail")}
              className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800/40 text-red-500 bg-white dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              Lihat detail →
            </button>
          </div>

        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {[
          { key: "info", label: "Data Registrasi VCF", always: true },
          { key: "reject_detail", label: "Detail Penolakan", always: isRejected },
          { key: "bagian2", label: "Weighbridge Masuk", always: !isRejected && (currentStep >= 2 || canFillBagian2 || (vcf?.pemeriksaan_masuk && vcf.pemeriksaan_masuk.length > 0)) },
          { key: "bagian3", label: "Weighbridge Keluar", always: !isRejected && (currentStep >= 3 || canFillBagian3 || (vcf?.pemeriksaan_keluar && vcf.pemeriksaan_keluar.length > 0)) },
          { key: "bagian4", label: "Main Gate Keluar", always: !isRejected && (currentStep >= 4 || canFillBagian4 || vcf?.status === "selesai") },
        ]
          .filter((t) => t.always)
          .map((tab) => (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              className="btn btn-sm flex-shrink-0"
              style={
                activeTab === tab.key
                  ? { background: "rgba(59,130,246,0.2)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" }
                  : { background: "rgba(255,255,255,0.04)", color: "var(--text-secondary)", border: "1px solid var(--border-light)" }
              }
              onClick={() => setActiveTab(tab.key as any)}
            >
              {tab.label}
            </button>
          ))}
      </div>
    {activeTab === "reject_detail" && (
      <div className="p-6">
        <div className="border border-red-200 dark:border-red-900/40 rounded-xl overflow-hidden bg-white dark:bg-transparent">

          {/* Header */}
          <div className="px-6 py-4 flex items-center gap-3 border-b border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-white/5 border border-red-200 dark:border-red-800/40 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400 m-0">Informasi penolakan</p>
              <p className="text-xs text-red-400 dark:text-red-500 m-0">Dokumen ini ditolak pada tahap berikut</p>
            </div>
            <div className="ml-auto">
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-white dark:bg-white/5 text-red-500 border border-red-200 dark:border-red-800/40">
                Ditolak
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Kiri: Tahap penolakan */}
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-2">Tahap penolakan</p>
              <div className="flex items-center gap-2 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h18M3 6l9-3 9 3M3 18l9 3 9-3"/>
                </svg>
                <p className="text-sm font-medium text-text-primary">
                  {currentStep === 2 ? "Weighbridge Masuk" : currentStep === 3 ? "Weighbridge Keluar" : "Pendaftaran"}
                </p>
              </div>

              {/* Progress steps */}
              <div className="flex flex-col gap-2">
                {/* Step 1: Pendaftaran */}
                <div className={`flex items-center gap-2 ${currentStep > 1 || currentStep === 1 ? "opacity-100" : "opacity-35"}`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${currentStep > 1 ? "bg-green-500" : currentStep === 1 ? "bg-red-500" : "bg-gray-400"}`} />
                  <span className={`text-xs ${currentStep === 1 ? "font-medium text-text-primary" : "text-text-secondary"}`}>Pendaftaran</span>
                  {currentStep > 1 && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                  {currentStep === 1 && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  )}
                </div>

                {/* Step 2: Weighbridge Masuk */}
                <div className={`flex items-center gap-2 ${currentStep >= 2 ? "opacity-100" : "opacity-35"}`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${currentStep > 2 ? "bg-green-500" : currentStep === 2 ? "bg-red-500" : "bg-gray-400"}`} />
                  <span className={`text-xs ${currentStep === 2 ? "font-medium text-text-primary" : "text-text-secondary"}`}>Weighbridge Masuk</span>
                  {currentStep > 2 && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                  {currentStep === 2 && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  )}
                </div>

                {/* Step 3: Weighbridge Keluar */}
                <div className={`flex items-center gap-2 ${currentStep >= 3 ? "opacity-100" : "opacity-35"}`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${currentStep > 3 ? "bg-green-500" : currentStep === 3 ? "bg-red-500" : "bg-gray-400"}`} />
                  <span className={`text-xs ${currentStep === 3 ? "font-medium text-text-primary" : "text-text-secondary"}`}>Weighbridge Keluar</span>
                  {currentStep === 3 && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Kanan: Alasan penolakan */}
            <div className="md:border-l border-border/40 md:pl-6">
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-2">Alasan penolakan</p>
              <div className="flex gap-2 items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-sm text-text-primary leading-relaxed">
                  {vcf.catatan || "Alasan tidak dicatat."}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    )}

      {activeTab === "info" && (
        <div className="glass-card p-6">
          {/* Edit registrasi (Bagian 1) */}
          {canEditRegistrasi && (
            <div className="mb-6 flex justify-end">
              <button
                className="btn btn-secondary flex items-center gap-2"
                onClick={() => router.push(`/vcf/${vcfId}/edit`)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                EDIT REGISTRASI
              </button>
            </div>
          )}

          {/* Logistik */}
          <div className="section-divider"><h3>Logistik</h3></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <InfoField label="Nomor Urut" value={vcf.nomor_urut} mono />
            <InfoField label="Tanggal" value={vcf.tanggal} />
            <InfoField label="Jam Masuk" value={(vcf.jam_masuk?.substring(0, 5) || "—") + " WIB"} />
            <InfoField label="Tujuan" value={vcf.asal_tujuan || "—"} />
            <InfoField label="Produk" value={vcf.produk || "—"} />
            <InfoField
              label="Tipe Kegiatan"
              value={vcf.tipe_kegiatan?.replace(/_/g, " ").toUpperCase()}
              highlight={vcf.tipe_kegiatan?.includes("loading") ? "#60a5fa" : "#34d399"}
            />
            <InfoField label="Tujuan" value={vcf.asal_tujuan || "—"} />
          </div>

          {/* Kendaraan */}
          <div className="section-divider"><h3>Kendaraan & Supir</h3></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <InfoField label="No. Polisi" value={vcf.no_polisi} mono />
            <InfoField label="Jenis Kendaraan" value={vcf.tipe_kendaraan?.replace(/_/g, " ").toUpperCase() || vcf.jenis_kendaraan?.nama || "—"} />
            <InfoField label="Transporter" value={vcf.transporter?.nama_transporter || "—"} />
            <InfoField label="Nama Supir" value={vcf.driver?.nama_supir || "—"} />
            <InfoField label="SIM Supir" value={vcf.driver?.no_sim || "—"} mono />
          </div>

          {/* Kelengkapan Supir */}
          {vcf.kelengkapan_supir && vcf.kelengkapan_supir.length > 0 && (
            <div className="section2">
              <h3>Pemeriksaan Kelengkapan Supir</h3>
            <div className="grid grid-cols-2 gap-3 mt-3">
          {vcf.kelengkapan_supir.map((ks) => (
                  <div
                    key={ks.id}
                    className="p-4 w-full rounded-2xl border transition-all"
                    style={{
                      background: ks.nilai ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)",
                      borderColor: ks.nilai ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)",
                    }}
                  > 
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-text-primary dark:text-slate-200 truncate">
                          {ks.item?.nama_item}
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                          Status: <span className="font-semibold">{ks.nilai ? "Ya" : "Tidak"}</span>
                        </p>
                      </div>
                      <span
                        className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl flex-shrink-0"
                        style={
                          ks.nilai
                            ? { background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.25)" }
                            : { background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }
                        }
                      >
                        {ks.nilai ? "LENGKAP" : "TIDAK"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Muatan */}
          {((vcf as any).muatan_dibawa?.length > 0 || (vcf as any).muatan_diisi?.length > 0) && (
            <div className="section2">
              <h3 className="text-center ">Jenis & Detail Muatan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3 w-full">
                {(vcf as any).muatan_dibawa && (vcf as any).muatan_dibawa.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Muatan Dibawa</h4>
                    <div className="space-y-1">
                      {(vcf as any).muatan_dibawa.map((m: any) => (
                        <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-primary dark:bg-white/5 border border-border/50">
                          <span className="text-sm text-text-primary dark:text-slate-300 font-medium">{m.item_muatan?.nama_item}</span>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${m.nilai === '1' ? 'bg-emerald-500/10 text-emerald-400' : m.nilai === '0' ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'}`}>
                            {m.nilai === "1" ? "YA" : m.nilai === "0" ? "TIDAK" : m.nilai}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(vcf as any).muatan_diisi && (vcf as any).muatan_diisi.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Muatan Diisi</h4>
                    <div className="space-y-1">
                      {(vcf as any).muatan_diisi.map((m: any) => (
                        <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-primary dark:bg-white/5 border border-border/50">
                          <span className="text-sm text-text-primary dark:text-slate-300 font-medium">{m.item_muatan?.nama_item}</span>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${m.nilai === '1' ? 'bg-emerald-500/10 text-emerald-400' : m.nilai === '0' ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'}`}>
                            {m.nilai === "1" ? "YA" : m.nilai === "0" ? "TIDAK" : m.nilai}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next action */}
          {!isDone && (
            <div className="mt-6 flex justify-end">
              {canFillBagian2 && (
                <button
                  id="btn-goto-bagian2"
                  className="btn btn-primary"
                  onClick={() => setActiveTab("bagian2")}
                >
                  Lanjut ke Bagian 2 →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "bagian2" && (
        <Suspense fallback={<FormSkeleton />}>
          <Bagian2Form
            vcfId={vcfId}
            canEdit={canFillBagian2}
            vcfData={vcf}
            onSuccess={() => { fetchVcf(); setActiveTab("bagian3"); }}
            onReject={() => { fetchVcf(); setActiveTab("info"); }}
          />
        </Suspense>
      )}

      {activeTab === "bagian3" && (
        <Suspense fallback={<FormSkeleton />}>
          <Bagian3Form
            vcfId={vcfId}
            canEdit={canFillBagian3}
            vcfData={vcf}
            onSuccess={() => { fetchVcf(); setActiveTab("bagian4"); }}
          />
        </Suspense>
      )}

      {activeTab === "bagian4" && (
        <Suspense fallback={<FormSkeleton />}>
          <Bagian4Form
            vcfId={vcfId}
            canEdit={canFillBagian4}
            vcfData={vcf}
            onSuccess={() => { fetchVcf(); }}
          />
        </Suspense>
      )}

      {/* Print Modal */}
      {showPrint && vcf && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center"><div className="spinner" /></div>}>
          <PrintVCF vcf={vcf as any} onClose={() => setShowPrint(false)} />
        </Suspense>
      )}
    </div>
  );
}

function InfoField({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: string }) {
  return (
    <div>
      <p className="form-label">{label}</p>
      <p
        className={mono ? "font-mono" : ""}
        style={{ color: highlight || "var(--text-primary)", fontSize: 14, fontWeight: 500 }}
      >
        {value || "—"}
      </p>
    </div>
  );
}
