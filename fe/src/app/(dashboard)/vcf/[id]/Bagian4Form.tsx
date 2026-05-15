"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { vcfApi } from "@/lib/api";
import { formatTime, isValidTime24h, getErrorMessage } from "@/lib/utils";
import { useToast, ToastContainer } from "@/components/Toast";


interface VcfData {
  nomor_urut: string;
  no_polisi: string;
  tanggal: string;
  tipe_kegiatan: string;
  jam_masuk: string;
  transporter?: { nama_transporter: string };
  driver?: { nama_supir: string };
  vcf_keluar?: { jam_keluar: string; emergency_respon_kontak: string; keterangan?: string };
  status: string;
  catatan?: string;
}

interface Props {
  vcfId: number;
  canEdit: boolean;
  canFill?: boolean;
  vcfData: VcfData;
  onSuccess: () => void;
}

export default function Bagian4Form({ vcfId, canEdit, canFill, vcfData, onSuccess }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toasts, removeToast, toast } = useToast();
  const [fieldErrors, setFieldErrors] = useState<{ jamKeluar?: boolean; emergencyKontak?: boolean; keterangan?: boolean }>({});
  const [jamKeluar, setJamKeluar] = useState("");
  const [emergencyKontak, setEmergencyKontak] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Pre-fill data if available
  useEffect(() => {
    if (vcfData.vcf_keluar) {
      const timeVal = vcfData.vcf_keluar.jam_keluar || "";
      let formattedTime = timeVal.substring(0, 5);
      if (timeVal.includes(":")) {
        const parts = timeVal.split(":");
        formattedTime = `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`.substring(0, 5);
      }
      setJamKeluar(formattedTime);
      setEmergencyKontak(vcfData.vcf_keluar.emergency_respon_kontak || "");
      setKeterangan(vcfData.vcf_keluar.keterangan || "");
      // If data exists and still before finalization, default to view mode (not editing)
      setIsEditing(false);
    } else if (canEdit) {
      setJamKeluar(formatTime());
    }
  }, [vcfData, canEdit]);

  const validateForm = (): { valid: boolean; message?: string } => {
    const errors: { jamKeluar?: boolean; emergencyKontak?: boolean; keterangan?: boolean } = {};
    
    if (!jamKeluar || jamKeluar.trim() === "") {
      errors.jamKeluar = true;
    } else if (!isValidTime24h(jamKeluar)) {
      errors.jamKeluar = true;
    }
    
    if (!emergencyKontak || emergencyKontak.trim() === "") {
      errors.emergencyKontak = true;
      setFieldErrors(errors);
      return { valid: false, message: "Emergency response kontak wajib diisi." };
    }
    
    if (!keterangan || keterangan.trim() === "") {
      errors.keterangan = true;
      setFieldErrors(errors);
      return { valid: false, message: "Keterangan wajib diisi." };
    }
    
    setFieldErrors(errors);
    return { valid: Object.keys(errors).length === 0 };
  };

  const handleSubmitInitial = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const validation = validateForm();
    if (!validation.valid) {
      setError(validation.message || "Harap lengkapi semua field yang wajib diisi.");
      // Scroll ke field error pertama
      const firstErrorEl = document.querySelector('[data-field-error="true"]');
      firstErrorEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    
    setShowConfirm(true);
  };

  const handleFinalize = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Simpan/Update data Bagian 4 (Jam Keluar)
      if (!vcfData.vcf_keluar) {
        await vcfApi.createBagian4(vcfId, {
          jam_keluar: jamKeluar,
          emergency_respon_kontak: emergencyKontak,
          keterangan: keterangan,
        });
      } else {
        await vcfApi.updateBagian4(vcfId, {
          jam_keluar: jamKeluar,
          emergency_respon_kontak: emergencyKontak,
          keterangan: keterangan,
        });
      }

      // 2. Langsung Finalisasi (Keluar Main Gate)
      await vcfApi.finalizeVcf(vcfId);

      toast.success("VCF Selesai", "Kendaraan telah dikonfirmasi keluar dari Main Gate.");
      onSuccess();
      setTimeout(() => router.push(`/vcf/${vcfId}`), 1000);
    } catch (err: unknown) {
      toast.error("Gagal", getErrorMessage(err, "Gagal memproses finalisasi VCF."));
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBagian4 = async () => {
    setLoading(true);
    setError("");
    try {
      await vcfApi.updateBagian4(vcfId, {
        jam_keluar: jamKeluar,
        emergency_respon_kontak: emergencyKontak,
        keterangan: keterangan,
      });
      toast.success("Berhasil", "Data Bagian 4 berhasil diperbarui.");
      setIsEditing(false);
      onSuccess();
    } catch (err: unknown) {
      toast.error("Gagal", getErrorMessage(err, "Gagal memperbarui Bagian 4."));
    } finally {
      setLoading(false);
    }
  };

  // Show completed view if status is selesai and user cannot edit
  if (vcfData.status === "selesai" && !canEdit) {
    return (
      <div className="space-y-6">
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-bg-primary dark:bg-white/5">
            <h3 className="font-bold text-text-primary dark:text-white uppercase tracking-wider text-sm">Hasil Akhir — Main Gate Keluar</h3>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <p className="text-[10px] uppercase font-bold text-emerald-500/60 tracking-widest mb-2">Waktu Keluar</p>
                <p className="text-3xl font-black text-emerald-400 font-mono">
                  {vcfData.vcf_keluar?.jam_keluar?.substring(0, 5) || "—"} <span className="text-sm font-normal opacity-60">WIB</span>
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-bg-primary dark:bg-white/5 border border-border/50">
                <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-2">Emergency Response Kontak</p>
                <p className="text-xl font-bold text-text-primary dark:text-white">
                  {vcfData.vcf_keluar?.emergency_respon_kontak || "—"}
                </p>
              </div>
            </div>

            {vcfData.vcf_keluar?.keterangan && (
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-2">Keterangan</p>
                <p className="text-sm text-text-primary dark:text-slate-200">{vcfData.vcf_keluar.keterangan}</p>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-border flex items-center justify-center gap-2 text-slate-400 text-xs italic">
              VCF Selesai Diproses
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show read-only view if data exists and not currently editing
  const hasExistingData = vcfData.vcf_keluar;
  const readOnlyView = hasExistingData ? (
      <div className="space-y-6">
        {vcfData.status === "reject" && (
          <div className="p-5 rounded-2xl border-2 animate-pulse" style={{ background: "rgba(239,68,68,0.05)", borderColor: "rgba(239,68,68,0.2)" }}>
            <div className="flex items-center gap-3 mb-2 text-red-400 font-bold">
              VCF Ditolak di Tahap Ini
            </div>
            <p className="text-sm pl-11" style={{ color: "#fca5a5" }}>
              Alasan: {vcfData.catatan || "Tidak ada alasan penolakan yang dicatat."}
            </p>
          </div>
        )}

        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-slate-50/50 dark:bg-white/5 flex justify-between items-center">
            <h3 className="font-bold text-text-primary dark:text-white uppercase tracking-wider text-sm">Hasil Pemeriksaan Main Gate Keluar</h3>
            {/* Only admin can edit existing data */}
            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-sm btn-secondary flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                EDIT
              </button>
            )}
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-1">Jam Keluar</p>
                  <p className="font-bold text-text-primary dark:text-slate-200">{vcfData.vcf_keluar?.jam_keluar?.substring(0, 5)} WIB</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-1">Emergency Response Kontak</p>
                  <p className="font-bold text-text-primary dark:text-slate-200">{vcfData.vcf_keluar?.emergency_respon_kontak}</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-2">Keterangan</p>
                <p className="text-sm text-text-primary dark:text-slate-200">{vcfData.vcf_keluar?.keterangan || "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : null;

  // Show waiting message if cannot fill and cannot edit
  if (!canFill && !canEdit) {
    return (
      <div className="p-8 rounded-2xl bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 text-center text-slate-400">
        Menunggu penyelesaian tahap sebelumnya untuk mengisi Bagian 4.
      </div>
    );
  }

  const isAlreadyFilled = !!vcfData.vcf_keluar;
  const isReadOnly = isAlreadyFilled && !isEditing;

  const formView = (
    <div className="max-w-4xl mx-auto space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-black text-black dark:text-white tracking-tight">Main Gate (Keluar)</h2>
          <p className="text-text-muted text-sm">
            {isAlreadyFilled 
              ? "Konfirmasi keluar area Main Gate untuk menyelesaikan VCF." 
              : "Pencatatan waktu keluar dan penutupan VCF secara permanen."}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Ringkasan */}
      <div className="glass-card p-6">
        <h3 className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-4">Ringkasan Perjalanan</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "No. Urut", value: vcfData.nomor_urut, mono: true },
            { label: "No. Polisi", value: vcfData.no_polisi },
            { label: "Tipe", value: vcfData.tipe_kegiatan?.toUpperCase() },
            { label: "Masuk", value: vcfData.jam_masuk + " WIB", mono: true },
          ].map(({ label, value, mono }) => (
            <div key={label}>
              <p className="text-[10px] text-text-muted mb-1">{label}</p>
              <p className={`text-sm font-bold text-text-primary dark:text-white ${mono ? "font-mono" : ""}`}>
                {value || "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmitInitial} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-2xl bg-white dark:bg-white/5 border-2 ${isAlreadyFilled ? "border-emerald-500/30" : "border-slate-100 dark:border-white/10"} focus-within:border-blue-500 transition-all`}>
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3 block">Jam Keluar (WIB)</label>
            <input
              type="text"
              className={`w-full bg-transparent text-2xl font-black font-mono focus:outline-none ${isAlreadyFilled ? "text-emerald-500" : ""}`}
              value={jamKeluar}
              onChange={(e) => {
                if (isReadOnly) return;
                let v = e.target.value.replace(/[^\d]/g, "");
                if (v.length > 4) v = v.slice(0, 4);
                setJamKeluar(v.length > 2 ? v.slice(0, 2) + ":" + v.slice(2) : v);
              }}
              readOnly={isReadOnly}
              placeholder="HH:MM"
              maxLength={5}
              required
            />
          </div>
          <div data-field-error={fieldErrors.emergencyKontak ? "true" : undefined} className={`p-6 rounded-2xl bg-white dark:bg-white/5 border-2 ${isAlreadyFilled ? "border-emerald-500/30" : fieldErrors.emergencyKontak ? "border-red-500 bg-red-50/30" : "border-slate-100 dark:border-white/10"} focus-within:border-blue-500 transition-all`}>
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3 block">Emergency Response Kontak *</label>
            <input
              type="text"
              className={`w-full bg-transparent text-lg font-bold focus:outline-none ${isAlreadyFilled ? "text-text-primary dark:text-white" : ""}`}
              placeholder="0812..."
              value={emergencyKontak}
              onChange={(e) => {
                if (isReadOnly) return;
                setEmergencyKontak(e.target.value);
                if (fieldErrors.emergencyKontak) {
                  setFieldErrors(prev => ({ ...prev, emergencyKontak: false }));
                }
              }}
              readOnly={isReadOnly}
            />
            {fieldErrors.emergencyKontak && (
              <p className="text-[11px] text-red-500 mt-2">Emergency response wajib diisi</p>
            )}
          </div>
        </div>

        <div data-field-error={fieldErrors.keterangan ? "true" : undefined} className={`p-6 rounded-2xl bg-white dark:bg-white/5 border-2 ${isAlreadyFilled ? "border-emerald-500/30" : fieldErrors.keterangan ? "border-red-500 bg-red-50/30" : "border-slate-100 dark:border-white/10"} focus-within:border-blue-500 transition-all`}>
          <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3 block">Keterangan *</label>
          <textarea
            className={`w-full bg-transparent text-base font-medium focus:outline-none resize-none ${isAlreadyFilled ? "text-text-primary dark:text-white" : ""}`}
            placeholder="Masukkan keterangan..."
            value={keterangan}
            onChange={(e) => {
              if (isReadOnly) return;
              setKeterangan(e.target.value);
              if (fieldErrors.keterangan) {
                setFieldErrors(prev => ({ ...prev, keterangan: false }));
              }
            }}
            readOnly={isReadOnly}
            rows={3}
          />
          {fieldErrors.keterangan && (
            <p className="text-[11px] text-red-500 mt-2">Keterangan wajib diisi</p>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10">
        </div>

        <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10">
          <p className="text-[10px] font-bold text-amber-500 uppercase leading-relaxed text-center">
            {isAlreadyFilled 
              ? "DATA TELAH DICATAT. SILAKAN KONFIRMASI KELUAR MAIN GATE SEKARANG." 
              : "Peringatan: Pastikan seluruh pemeriksaan telah selesai sebelum mengonfirmasi keluar Main Gate."}
          </p>
        </div>

        <div className="flex gap-4">
          {/* Only admin can edit existing data */}
          {isAlreadyFilled && !isEditing && canEdit && (
            <button
              type="button"
              className="px-8 py-4 rounded-2xl font-bold text-sm bg-blue-500/10 text-blue-500 border-2 border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all duration-300"
              onClick={() => setIsEditing(true)}
              disabled={loading}
            >
              EDIT DATA
            </button>
          )}

          {isAlreadyFilled && isEditing && (
            <>
              <button
                type="button"
                className="px-8 py-4 rounded-2xl font-bold text-sm bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 border-2 border-transparent hover:bg-slate-300 dark:hover:bg-white/20 transition-all duration-300"
                onClick={() => {
                  const timeVal = vcfData.vcf_keluar?.jam_keluar || "";
                  let formattedTime = timeVal.substring(0, 5);
                  if (timeVal.includes(":")) {
                    const parts = timeVal.split(":");
                    formattedTime = `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`.substring(0, 5);
                  }
                  setJamKeluar(formattedTime);
                  setEmergencyKontak(vcfData.vcf_keluar?.emergency_respon_kontak || "");
                  setKeterangan(vcfData.vcf_keluar?.keterangan || "");
                  setIsEditing(false);
                  setError("");
                }}
                disabled={loading}
              >
                BATAL
              </button>
              <button
                type="button"
                className="flex-1 py-4 rounded-2xl font-bold bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-3"
                onClick={handleUpdateBagian4}
                disabled={loading}
              >
                {loading ? "MEMPROSES..." : "SIMPAN PERUBAHAN"}
              </button>
            </>
          )}

          {!isAlreadyFilled && (
            <button
              type="button"
              className="px-8 py-4 rounded-2xl font-bold text-sm bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 border-2 border-transparent hover:bg-slate-300 dark:hover:bg-white/20 transition-all duration-300"
              onClick={() => {
                setJamKeluar(formatTime());
                setEmergencyKontak("");
                setError("");
              }}
              disabled={loading}
            >
              RESET
            </button>
          )}

          {/* Konfirmasi keluar hanya saat sudah terisi dan tidak sedang edit */}
          {isAlreadyFilled && !isEditing && (
            <button
              type="submit"
              className="flex-1 py-4 rounded-2xl font-bold bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-3"
              disabled={loading}
            >
              {loading ? "MEMPROSES..." : "KONFIRMASI KELUAR SEKARANG"}
            </button>
          )}

          {/* Simpan & finalisasi untuk status bagian3_selesai */}
          {!isAlreadyFilled && (
            <button
              type="submit"
              className="flex-1 py-4 rounded-2xl font-bold bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-3"
              disabled={loading}
            >
              {loading ? "MEMPROSES..." : "SIMPAN & SELESAIKAN"}
            </button>
          )}
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300">
            <div className="relative p-8">
              <div className="absolute top-0 right-0 p-6">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="mb-8">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Finalisasi Keluar?</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Kendaraan <strong>{vcfData.no_polisi}</strong> ({vcfData.driver?.nama_supir}) akan dinyatakan keluar dari area pabrik.
                </p>
              </div>

              <div className="space-y-4 mb-10">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Jam Keluar</span>
                  <span className="text-xl font-black text-emerald-500 font-mono">{jamKeluar} WIB</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleFinalize}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      MEMPROSES...
                    </>
                  ) : (
                    "YA, KONFIRMASI KELUAR"
                  )}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white transition-all"
                >
                  BATAL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (hasExistingData && !isEditing) return readOnlyView;
  
  if (hasExistingData && isEditing) {
    return (
      <>
        {readOnlyView}
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => { setIsEditing(false); setError(""); }}>
          <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto p-2 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-bg-card z-10 flex justify-between items-center mb-6 pb-4 border-b border-border">
               <div>
                 <h2 className="text-xl font-bold">Edit Main Gate (Keluar)</h2>
                 <p className="text-xs text-text-muted mt-1">Perbarui hasil pencatatan akhir kendaraan.</p>
               </div>
               <button onClick={() => { setIsEditing(false); setError(""); }} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">✕</button>
            </div>
            {formView}
          </div>
        </div>
      </>
    );
  }

  return formView;
}
