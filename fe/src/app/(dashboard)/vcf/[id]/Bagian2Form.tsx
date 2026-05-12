"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { vcfApi, masterApi } from "@/lib/api";

interface CheckItem {
  id: number;
  nama_item: string;
  tipe_jawaban: string;
  pilihan_jawaban?: string;
  kode?: string;
}

interface Props {
  vcfId: number;
  canEdit: boolean;
  vcfData: any;
  onSuccess: () => void;
  onReject: () => void;
}

export default function Bagian2Form({ vcfId, canEdit, vcfData, onSuccess, onReject }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<number, boolean>>({});
  const [pemeriksaanItems, setPemeriksaanItems] = useState<CheckItem[]>([]);
  const [pemeriksaan, setPemeriksaan] = useState<Record<number, string>>({});
  const [keteranganMap, setKeteranganMap] = useState<Record<number, string>>({});

  // States for detail fields (triggered by specific item codes)
  const [jenisBeban, setJenisBeban] = useState("");
  const [jumlahSegel, setJumlahSegel] = useState("");
  const [nomorSegel, setNomorSegel] = useState<string[]>([""]);
  const [keteranganUmum, setKeteranganUmum] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Reject Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await masterApi.getItemPemeriksaanMasuk();
        const items = (res.data.data || res.data).filter(
          (i: CheckItem & { is_active?: boolean }) => i.is_active !== false
        );
        setPemeriksaanItems(items);
        const initial: Record<number, string> = {};
        items.forEach((i: CheckItem) => { initial[i.id] = ""; });
        setPemeriksaan(initial);
      } catch (e) {
        console.error(e);
      }
    };
    fetchItems();
  }, []);

  // Reset segel fields when segel value is not 'Terpasang'
  useEffect(() => {
    const segelItem = pemeriksaanItems.find(i => i.kode === "SGM");
    if (segelItem && pemeriksaan[segelItem.id] !== "Terpasang") {
      setJumlahSegel("");
      setNomorSegel([""]);
    }
  }, [pemeriksaan, pemeriksaanItems]);

  const updateSegel = (idx: number, val: string) => {
    setNomorSegel((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const addSegelInput = () => {
    setNomorSegel((prev) => {
      const next = [...prev, ""];
      setJumlahSegel(String(next.length));
      return next;
    });
  };

  const removeSegelInput = (idx: number) => {
    setNomorSegel((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, i) => i !== idx);
      setJumlahSegel(String(next.length));
      return next;
    });
  };

  const syncJumlahSegel = (val: string) => {
    const raw = val.replace(/[^\d]/g, "");
    setJumlahSegel(raw);
    const n = Math.max(0, Math.min(100, parseInt(raw || "0", 10)));
    if (n <= 0) {
      setNomorSegel([""]);
      return;
    }
    setNomorSegel((prev) => {
      const next = [...prev];
      if (next.length === n) return next;
      if (next.length < n) {
        return [...next, ...Array.from({ length: n - next.length }, () => "")];
      }
      return next.slice(0, n);
    });
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setError("");
    setLoading(true);
    try {
      await vcfApi.rejectBagian2(vcfId, { catatan_reject: rejectReason });
      setShowRejectModal(false);
      router.push("/vcf");
      onReject();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || "Gagal reject VCF.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    // Pre-populate data from vcfData
    if (vcfData.pemeriksaan_masuk) {
      const initial: Record<number, string> = {};
      const ketInitial: Record<number, string> = {};
      vcfData.pemeriksaan_masuk.forEach((pm: any) => {
        initial[pm.item_id] = pm.nilai;
        ketInitial[pm.item_id] = pm.keterangan || "";
      });
      setPemeriksaan(initial);
      setKeteranganMap(ketInitial);
    }
    
    if (vcfData.beban_tambahan_masuk) {
      setJenisBeban(vcfData.beban_tambahan_masuk.jenis_beban || "");
    }
    
    if (vcfData.segel_masuk) {
      setJumlahSegel(String(vcfData.segel_masuk.jumlah_segel || ""));
      setNomorSegel(vcfData.segel_masuk.nomor_segel?.map((s: any) => s.nomor_segel) || [""]);
    }
    
    setKeteranganUmum(vcfData.vcf_bagian2?.keterangan || vcfData.catatan || "");
    setIsEditing(true);
  };

  const validateForm = (): { valid: boolean; message?: string } => {
    const errors: Record<number, boolean> = {};
    let hasError = false;

    // Validasi setiap item pemeriksaan harus diisi
    pemeriksaanItems.forEach((item) => {
      const value = pemeriksaan[item.id];
      if (!value || value.trim() === "" || value === "—") {
        errors[item.id] = true;
        hasError = true;
      }
    });

    const btmItem = pemeriksaanItems.find(i => i.kode === "BTM");
    const sgmItem = pemeriksaanItems.find(i => i.kode === "SGM");

    // Validasi beban tambahan - jika "Ada" harus isi jenis beban
    if (btmItem && pemeriksaan[btmItem.id] === "Ada" && !jenisBeban.trim()) {
      errors[btmItem.id] = true;
      hasError = true;
      setFieldErrors(errors);
      return { valid: false, message: "Jenis beban tambahan wajib diisi jika memilih 'Ada'." };
    }

    // Validasi segel - jika "Terpasang" harus isi nomor segel
    if (sgmItem && pemeriksaan[sgmItem.id] === "Terpasang") {
      const validSegel = nomorSegel.filter(s => s.trim()).length > 0;
      if (!validSegel) {
        errors[sgmItem.id] = true;
        hasError = true;
        setFieldErrors(errors);
        return { valid: false, message: "Nomor segel wajib diisi jika memilih 'Terpasang'." };
      }
    }

    setFieldErrors(errors);
    return { valid: !hasError, message: hasError ? "Harap lengkapi semua pemeriksaan yang belum diisi." : undefined };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validasi client-side sebelum submit
    const validation = validateForm();
    if (!validation.valid) {
      setError(validation.message || "Harap lengkapi semua pemeriksaan yang belum diisi.");
      const firstErrorEl = document.querySelector('[data-error="true"]');
      firstErrorEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setLoading(true);
    try {
      const pemItems = pemeriksaanItems.map((item) => ({
        item_id: item.id,
        nilai: pemeriksaan[item.id],
        keterangan: keteranganMap[item.id] || null,
      }));

      const btmItem = pemeriksaanItems.find(i => i.kode === "BTM");
      const sgmItem = pemeriksaanItems.find(i => i.kode === "SGM");

      const payload = {
        pemeriksaan: pemItems,
        beban_tambahan_ada: btmItem ? pemeriksaan[btmItem.id] === "Ada" : false,
        jenis_beban: jenisBeban || null,
        segel_terpasang: sgmItem ? pemeriksaan[sgmItem.id] === "Terpasang" : false,
        jumlah_segel:
          sgmItem && pemeriksaan[sgmItem.id] === "Terpasang"
            ? (jumlahSegel ? parseInt(jumlahSegel, 10) : nomorSegel.length)
            : null,
        nomor_segel: (sgmItem && pemeriksaan[sgmItem.id] === "Terpasang") ? nomorSegel.map((s) => s.trim()).filter(Boolean) : [],
        keterangan: keteranganUmum || null,
      };

      if (isEditing) {
        await vcfApi.updateBagian2(vcfId, payload);
        setIsEditing(false);
      } else {
        await vcfApi.createBagian2(vcfId, payload);
      }
      
      router.push("/vcf");
      onSuccess();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || "Gagal menyimpan Bagian 2.");
    } finally {
      setLoading(false);
    }
  };

  if (!canEdit && !isEditing) {
    return (
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
            <h3 className="font-bold text-text-primary dark:text-white uppercase tracking-wider text-sm">Hasil Pemeriksaan Weighbridge Masuk</h3>
            {vcfData.status !== 'selesai' && (
              <button 
                onClick={handleEdit}
                className="btn btn-sm btn-secondary flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                EDIT
              </button>
            )}
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vcfData.pemeriksaan_masuk?.map((pm: any) => (
                <div key={pm.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-1">{pm.item?.nama_item}</p>
                    <p className="font-bold text-text-primary dark:text-slate-200">{pm.nilai}</p>
                  </div>
                  {(pm.nilai === 'Rusak' || pm.nilai === 'Tidak' || pm.nilai === 'Tidak Ada') ? (
                    <div className="text-[10px] font-black text-red-500 bg-red-500/10 px-2 py-1 rounded uppercase">{pm.nilai}</div>
                  ) : (
                    <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded uppercase">{pm.nilai}</div>
                  )}
                </div>
              ))}
            </div>

            {(vcfData.beban_tambahan_masuk || vcfData.segel_masuk) && (
              <div className="mt-6 pt-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
                {vcfData.beban_tambahan_masuk && (
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                    <p className="form-label text-blue-500">Beban Tambahan</p>
                    <span className="px-2 py-1 bg-blue-500/1  0 rounded text-[16px] font-mono text-blue-500 font-bold">
                    {vcfData.beban_tambahan_masuk.jenis_beban}{/* <p className="text-sm font-bold  bg-blue-500/10 rounded text-blue-500">{vcfData.beban_tambahan_masuk.jenis_beban}</p> */}
                    </span>
                  </div>
                )}
                {vcfData.segel_masuk && (
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <p className="form-label text-emerald-400">Segel ({vcfData.segel_masuk.jumlah_segel} Unit)</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {vcfData.segel_masuk.nomor_segel?.map((s: any, i: number) => (
                        <span key={i} className="px-2 py-1 bg-emerald-500/10 rounded text-[14px] font-mono text-emerald-500 font-bold">
                          {s.nomor_segel}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-black dark:text-white tracking-tight">{isEditing ? "Edit Security Weighbridge (Masuk)" : "Security Weighbridge (Masuk)"}</h2>
          <p className="text-slate-500 text-sm">{isEditing ? "Perbarui hasil validasi fisik kendaraan." : "Validasi fisik kendaraan sebelum penimbangan masuk."}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 animate-headShake">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {pemeriksaanItems.map((item) => {
            const options = item.tipe_jawaban && item.tipe_jawaban.includes(',') ? item.tipe_jawaban.split(',') : null;
            const isSelect = Array.isArray(options) && options.length > 0;
            const value = pemeriksaan[item.id];
            const hasError = fieldErrors[item.id];

            return (
              <div key={item.id} className="group transition-all duration-300" data-error={hasError ? "true" : undefined}>
                <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${hasError 
                  ? 'bg-red-50/50 dark:bg-red-500/5 border-red-500 shadow-lg shadow-red-500/10 animate-pulse' 
                  : value 
                    ? 'bg-white dark:bg-white/5 border-blue-500/50 shadow-lg shadow-blue-500/5' 
                    : 'bg-slate-50/50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5 hover:border-slate-200'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-text-primary dark:text-slate-200">{item.nama_item}</span>
                    </div>

                    {isSelect ? (
                      <div className="flex flex-wrap gap-2">
                        {options.map((opt: string) => {
                          const isSelected = value === opt;
                          const isWarning = opt === "Rusak" || opt === "Tidak Terpasang" || opt === "Tidak Ada";
                          return (
                            <label
                              key={opt}
                              className={`
                                cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border-2
                                ${isSelected 
                                  ? (isWarning ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-500/20' : 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20')
                                  : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:border-slate-300 dark:hover:border-white/20'
                                }
                              `}
                            >
                              <input
                                type="radio"
                                className="hidden"
                                name={`pem-${item.id}`}
                                checked={isSelected}
                                onChange={() => setPemeriksaan((p) => ({ ...p, [item.id]: opt }))}
                              />
                              {opt}
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <input
                        type="text"
                        className="form-input md:max-w-[240px] bg-white dark:bg-white/5"
                        placeholder="Masukan hasil pemeriksaan..."
                        value={value || ""}
                        onChange={(e) => setPemeriksaan((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      />
                    )}
                  </div>

                  {/* Contextual Details */}
                  {item.kode === "BTM" && value === "Ada" && (
                    <div className="mt-4 pt-4 border-t border-blue-500/10 animate-slideDown">
                      <label className="form-label text-blue-400">Sebutkan Jenis Beban</label>
                      <input
                        type="text"
                        className="form-input bg-blue-500/5 border-blue-500/20 focus:border-blue-500"
                        placeholder="Contoh: Sparepart, Ban Serep, dll..."
                        value={jenisBeban}
                        onChange={(e) => setJenisBeban(e.target.value)}
                      />
                    </div>
                  )}

                  {item.kode === "SGM" && value === "Terpasang" && (
                    <div className="mt-4 pt-4 border-t border-emerald-500/10 animate-slideDown space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="form-label text-emerald-400">Nomor Segel Kendaraan</label>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-emerald-500/60 uppercase">Jumlah:</span>
                          <input
                            type="number"
                            className="w-16 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs font-bold text-emerald-400 text-center focus:outline-none focus:border-emerald-500"
                            value={jumlahSegel || String(nomorSegel.length)}
                            onChange={(e) => syncJumlahSegel(e.target.value)}
                            min={1}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {nomorSegel.map((segel, idx) => (
                          <div key={idx} className="relative group/segel">
                            <input
                              type="text"
                              className="form-input form-input-sm bg-emerald-500/5 border-emerald-500/10 focus:border-emerald-500 pr-10"
                              placeholder={`Segel #${idx + 1}`}
                              value={segel}
                              onChange={(e) => updateSegel(idx, e.target.value)}
                            />
                            {nomorSegel.length > 1 && (
                              <button 
                                type="button" 
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center opacity-0 group-hover/segel:opacity-100"
                                onClick={() => removeSegelInput(idx)}
                              >✕</button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button 
                        type="button" 
                        className="w-full py-2 border-2 border-dashed border-emerald-500/30 rounded-xl text-[10px] font-bold text-emerald-500 uppercase hover:bg-emerald-500/5 transition-colors"
                        onClick={addSegelInput}
                      >+ Tambah Baris Segel</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
          <label className="form-label">Keterangan Opsional</label>
          <textarea
            className="form-input bg-white dark:bg-white/5 min-h-[100px]"
            placeholder="Tambahkan catatan jika diperlukan..."
            value={keteranganUmum}
            onChange={(e) => setKeteranganUmum(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          {!isEditing && (
            <button
              type="button"
              className="px-8 py-4 rounded-2xl font-bold text-sm bg-red-500/10 text-red-500 border-2 border-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-300"
              onClick={() => setShowRejectModal(true)}
              disabled={loading}
            >
              TOLAK (REJECT)
            </button>
          )}
          {isEditing ? (
            <button
              type="button"
              className="px-8 py-4 rounded-2xl font-bold text-sm bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 border-2 border-transparent hover:bg-slate-300 dark:hover:bg-white/20 transition-all duration-300"
              onClick={() => { setIsEditing(false); setError(""); }}
              disabled={loading}
            >
              BATAL
            </button>
          ) : (
            <button
              type="button"
              className="px-8 py-4 rounded-2xl font-bold text-sm bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 border-2 border-transparent hover:bg-slate-300 dark:hover:bg-white/20 transition-all duration-300"
              onClick={() => {
                const resetObj: Record<number, string> = {};
                pemeriksaanItems.forEach(i => { resetObj[i.id] = ""; });
                setPemeriksaan(resetObj);
                setJenisBeban("");
                setJumlahSegel("");
                setNomorSegel([""]);
                setKeteranganUmum("");
                setError("");
              }}
              disabled={loading}
            >
              RESET
            </button>
          )}
          <button
            type="submit"
            className="flex-1 py-4 rounded-2xl font-bold text-sm bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-500 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> MEMPROSES...</> : (isEditing ? "SIMPAN PERUBAHAN" : "SIMPAN & LANJUTKAN")}
          </button>
        </div>
      </form>

      {/* Reject Modal Redesign */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content max-w-md p-0 overflow-hidden border-none shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-red-500 p-8 text-white">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4 font-black text-2xl">
                !
              </div>
              <h2 className="text-2xl font-black tracking-tight">Konfirmasi Penolakan</h2>
              <p className="text-red-100 text-sm mt-1">Berikan alasan yang jelas mengapa VCF ini ditolak.</p>
            </div>
            
            <div className="p-8 space-y-6">
              <textarea
                className="form-input w-full min-h-[120px] bg-slate-50 dark:bg-white/5 border-slate-200 focus:border-red-500 focus:ring-red-500/20"
                placeholder="Tulis alasan penolakan di sini..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                autoFocus
              />
              
              <div className="flex gap-3">
                <button 
                  className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                  onClick={() => setShowRejectModal(false)}
                >BATAL</button>
                <button
                  className="flex-[2] py-3 rounded-xl font-bold bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all"
                  onClick={handleReject}
                  disabled={loading || !rejectReason.trim()}
                >YA, TOLAK VCF</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

