"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { masterApi, vcfApi } from "@/lib/api";
import { formatTime, isValidTime24h } from "@/lib/utils";

interface SelectOption {
  id: number;
  nama?: string;
  nama_transporter?: string;
  nama_supir?: string;
  nama_item?: string;
  kode?: string;
  no_sim?: string;
  tgl_berlaku_sim?: string;
  jenis_sim?: string;
  is_active?: boolean | number | string;
}

interface ChecklistItem {
  id: number;
  nama_item: string;
  urutan: number;
  is_active?: boolean | number | string;
}

interface MuatanItem {
  id: number;
  nama_item: string;
  jenis: "both" | "dibawa" | "diisi";
  urutan: number;
  is_active?: boolean | number | string;
}

type TipeKegiatan = "loading_lokal" | "loading_export" | "unloading_lokal" | "unloading_import" | "";
type TipeKendaraan = "bak_terbuka" | "tangki" | "umum" | "box" | "container" | "";

const PRODUK_OPTIONS = [
  { kode: "CPO", label: "CPO" },
  { kode: "RBDPO", label: "RBDPO" },
  { kode: "RBDOL", label: "RBDOL" },
  { kode: "RBDST", label: "RBDST" },
  { kode: "PFAD", label: "PFAD" },
  { kode: "OTHERS", label: "Others" },
] as const;

function normalizeToHHmm(value: string): string {
  // Accept "HH:MM" or "HH:MM:SS" (or any extra) and normalize to "HH:MM".
  // Also handles odd chars by stripping to digits/colon.
  const cleaned = (value || "").replace(/[^\d:]/g, "");
  const m = cleaned.match(/^(\d{2}):(\d{2})/);
  if (!m) return cleaned;
  return `${m[1]}:${m[2]}`;
}

export default function VcfEditBagian1Page() {
  const params = useParams();
  const router = useRouter();
  const vcfId = Number(params.id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  // Master data
  const [transporters, setTransporters] = useState<SelectOption[]>([]);
  const [drivers, setDrivers] = useState<SelectOption[]>([]);
  const [allDrivers, setAllDrivers] = useState<SelectOption[]>([]);
  const [jenisKendaraan, setJenisKendaraan] = useState<SelectOption[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [muatanItems, setMuatanItems] = useState<MuatanItem[]>([]);

  // Form state
  const [tanggal, setTanggal] = useState("");
  const [jamMasuk, setJamMasuk] = useState("");
  const [tipeKegiatan, setTipeKegiatan] = useState<TipeKegiatan>("");
  const [produkKode, setProdukKode] = useState<(typeof PRODUK_OPTIONS)[number]["kode"] | "">("");
  const [produkLainnya, setProdukLainnya] = useState("");
  const [transporterId, setTransporterId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [noPolisi, setNoPolisi] = useState("");
  const [jenisKendaraanId, setJenisKendaraanId] = useState("");
  const [tipeKendaraan, setTipeKendaraan] = useState<TipeKendaraan>("");
  const [tahunKendaraan, setTahunKendaraan] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [checklist, setChecklist] = useState<Record<number, boolean | null>>({});

  const [muatanDibawa, setMuatanDibawa] = useState<Record<number, { checked: boolean; nilai: string }>>({});
  const [muatanDiisi, setMuatanDiisi] = useState<Record<number, { checked: boolean; nilai: string }>>({});

  const isLoadingKegiatan = tipeKegiatan.startsWith("loading");
  const isUnloadingKegiatan = tipeKegiatan.startsWith("unloading");

  const canEdit = useMemo(() => {
    // Guard UI; backend is source of truth.
    // Edit allowed before status selesai/reject.
    return true;
  }, []);

  useEffect(() => {
    const fetchMaster = async () => {
      const [tRes, dRes, jRes, cRes, mRes] = await Promise.all([
        masterApi.getTransporters(),
        masterApi.getDrivers(),
        masterApi.getJenisKendaraan(),
        masterApi.getItemKelengkapanSupir(),
        masterApi.getItemMuatan(),
      ]);

      const tData = (tRes.data.data || tRes.data).filter((t: SelectOption) => t.is_active === true || t.is_active === 1 || t.is_active === "1");
      const dData = (dRes.data.data || dRes.data).filter((d: SelectOption) => d.is_active === true || d.is_active === 1 || d.is_active === "1");
      const jData = (jRes.data.data || jRes.data).filter((j: SelectOption) => j.is_active === true || j.is_active === 1 || j.is_active === "1");
      const cItemsRaw: ChecklistItem[] = (cRes.data.data || cRes.data).filter((c: ChecklistItem) => c.is_active === true || c.is_active === 1 || c.is_active === "1");
      const mItemsRaw: MuatanItem[] = (mRes.data.data || mRes.data).filter((m: MuatanItem) => m.is_active === true || m.is_active === 1 || m.is_active === "1");

      setTransporters(tData);
      setAllDrivers(dData);
      setDrivers(dData);
      setJenisKendaraan(jData);

      const cItems = cItemsRaw.sort((a, b) => a.urutan - b.urutan);
      setChecklistItems(cItems);

      const mItems = mItemsRaw.sort((a, b) => a.urutan - b.urutan);
      setMuatanItems(mItems);
    };

    const fetchDetail = async () => {
      const res = await vcfApi.getDetail(vcfId);
      const v = res.data;

      if (["selesai", "reject"].includes(v.status)) {
        router.replace(`/vcf/${vcfId}`);
        return;
      }

      setTanggal(v.tanggal || "");
      setJamMasuk(normalizeToHHmm(v.jam_masuk || formatTime()));
      setTipeKegiatan((v.tipe_kegiatan as TipeKegiatan) || "");

      const produk: string = v.produk || "";
      const found = PRODUK_OPTIONS.find((p) => p.kode === produk);
      if (found) {
        setProdukKode(found.kode);
      } else if (produk.startsWith("OTHERS:")) {
        setProdukKode("OTHERS");
        setProdukLainnya(produk.replace(/^OTHERS:\s*/i, "").trim());
      } else if (produk) {
        // Fallback: keep as OTHERS for unknown code
        setProdukKode("OTHERS");
        setProdukLainnya(produk);
      }

      setTransporterId(String(v.transporter_id || ""));
      setDriverId(String(v.driver_id || ""));
      setNoPolisi(v.no_polisi || "");
      setJenisKendaraanId(String(v.jenis_kendaraan_id || ""));
      setTipeKendaraan((v.tipe_kendaraan as TipeKendaraan) || "");
      setTahunKendaraan(v.tahun_kendaraan ? String(v.tahun_kendaraan) : "");
      setTujuan(v.asal_tujuan && v.asal_tujuan !== "-" ? v.asal_tujuan : "");
      setKeterangan(v.keterangan && v.keterangan !== "-" ? v.keterangan : "");

      const initialChecklist: Record<number, boolean | null> = {};
      (v.kelengkapan_supir || []).forEach((ks: any) => {
        initialChecklist[ks.item_id] = !!ks.nilai;
      });
      setChecklist(initialChecklist);

      const initDibawa: Record<number, { checked: boolean; nilai: string }> = {};
      const initDiisi: Record<number, { checked: boolean; nilai: string }> = {};
      (v.muatan_dibawa || []).forEach((m: any) => {
        if (m.item_muatan_id) initDibawa[m.item_muatan_id] = { checked: true, nilai: m.nilai ?? "1" };
      });
      (v.muatan_diisi || []).forEach((m: any) => {
        if (m.item_muatan_id) initDiisi[m.item_muatan_id] = { checked: true, nilai: m.nilai ?? "1" };
      });
      setMuatanDibawa(initDibawa);
      setMuatanDiisi(initDiisi);
    };

    (async () => {
      try {
        await Promise.all([fetchMaster(), fetchDetail()]);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Gagal memuat data untuk edit.");
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [router, vcfId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setError("");
    const jamMasukNormalized = normalizeToHHmm(jamMasuk);
    if (jamMasuk !== jamMasukNormalized) setJamMasuk(jamMasukNormalized);

    if (!isValidTime24h(jamMasukNormalized)) {
      setError("Jam masuk ber format 24 jam (HH:MM) WIB.");
      return;
    }
    if (!tipeKegiatan) { setError("Pilih tipe kegiatan (Loading/Unloading)."); return; }
    if (!produkKode) { setError("Pilih produk."); return; }
    if (produkKode === "OTHERS" && !produkLainnya.trim()) { setError("Isi produk lainnya (Others)."); return; }
    if (!transporterId) { setError("Pilih transporter."); return; }
    if (!driverId) { setError("Pilih supir."); return; }
    if (!noPolisi) { setError("Masukkan nomor polisi."); return; }
    if (!jenisKendaraanId) { setError("Pilih jenis kendaraan."); return; }

    if (tahunKendaraan) {
      const year = parseInt(tahunKendaraan, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year > currentYear) {
        setError(`Tahun kendaraan tidak boleh lebih dari ${currentYear}.`);
        return;
      }
    }

    // Ensure checklist fully filled for master items (after master loaded)
    const allItemsFilled = checklistItems.length > 0 && checklistItems.every((item) => checklist[item.id] !== null && typeof checklist[item.id] !== "undefined");
    if (!allItemsFilled) {
      setError("Semua item pemeriksaan kelengkapan supir wajib diisi (Ya/Tidak).");
      return;
    }

    const kelengkapanSupir = checklistItems.map((item) => ({
      item_id: item.id,
      nilai: !!checklist[item.id],
      keterangan: "-",
    }));

    const produkStr = produkKode === "OTHERS" ? `OTHERS: ${produkLainnya.trim()}` : produkKode;

    const buildMuatanPayload = (src: Record<number, { checked: boolean; nilai: string }>) => {
      return Object.entries(src)
        .filter(([, v]) => v.checked)
        .map(([id, v]) => ({
          item_muatan_id: parseInt(id, 10),
          nilai: v.nilai?.trim() ? v.nilai.trim() : "1",
          keterangan: "-",
        }));
    };

    const payload = {
      tanggal,
      produk: produkStr,
      tipe_kegiatan: tipeKegiatan,
      asal_tujuan: tujuan || "-",
      jenis_kendaraan_id: parseInt(jenisKendaraanId, 10),
      no_polisi: noPolisi.toUpperCase(),
      tipe_kendaraan: tipeKendaraan || "-",
      tahun_kendaraan: tahunKendaraan ? parseInt(tahunKendaraan, 10) : null,
      transporter_id: parseInt(transporterId, 10),
      driver_id: parseInt(driverId, 10),
      jam_masuk: jamMasukNormalized,
      kelengkapan_supir: kelengkapanSupir,
      muatan_dibawa: isUnloadingKegiatan ? buildMuatanPayload(muatanDibawa) : [],
      muatan_diisi: isLoadingKegiatan ? buildMuatanPayload(muatanDiisi) : [],
      keterangan: keterangan.trim() || "-",
    };

    setLoading(true);
    try {
      await vcfApi.updateBagian1(vcfId, payload);
      router.push(`/vcf/${vcfId}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Gagal menyimpan perubahan VCF.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="spinner" style={{ width: 32, height: 32 }} />
        <span className="ml-3" style={{ color: "var(--text-muted)" }}>Memuat data edit VCF...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title text-3xl mb-1">Edit Registrasi VCF</h1>
          <p className="page-subtitle text-lg">Perubahan data Bagian 1 (Main Gate Masuk)</p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={() => router.back()}>
          Kembali
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl flex items-center gap-3" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--accent-danger)" }}>
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ringkas: reuse layout register page with minimal changes */}
        <div className="glass-card p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="form-label">Tanggal</label>
              <input type="date" className="form-input text-lg" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
            </div>
            <div>
              <label className="form-label">Jam Masuk (WIB)</label>
              <input
                type="text"
                className="form-input text-lg font-mono"
                value={jamMasuk}
                onChange={(e) => {
                  let v = e.target.value.replace(/[^\d]/g, "");
                  if (v.length > 4) v = v.slice(0, 4);
                  setJamMasuk(v.length > 2 ? v.slice(0, 2) + ":" + v.slice(2) : v);
                }}
                placeholder="HH:MM"
                maxLength={5}
                required
              />
            </div>
            <div>
              <label className="form-label">Tipe Kegiatan</label>
              <select className="form-select" value={tipeKegiatan} onChange={(e) => setTipeKegiatan(e.target.value as any)} required>
                <option value="">Pilih</option>
                <option value="loading_lokal">Loading Lokal</option>
                <option value="loading_export">Loading Export</option>
                <option value="unloading_lokal">Unloading Lokal</option>
                <option value="unloading_import">Unloading Import</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label mb-3">Produk *</label>
            <div className="flex flex-wrap gap-2">
              {PRODUK_OPTIONS.map((p) => (
                <button
                  key={p.kode}
                  type="button"
                  onClick={() => setProdukKode(p.kode)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${produkKode === p.kode ? "bg-blue-500 border-blue-500 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {produkKode === "OTHERS" && (
              <input type="text" className="form-input mt-3" placeholder="Sebutkan produk lainnya..." value={produkLainnya} onChange={(e) => setProdukLainnya(e.target.value)} required />
            )}
          </div>
        </div>

        <div className="glass-card p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="form-label">Nama Transporter *</label>
                <select className="form-select" value={transporterId} onChange={(e) => setTransporterId(e.target.value)} required>
                  <option value="">Pilih Transporter</option>
                  {transporters.map((t) => (
                    <option key={t.id} value={t.id}>{t.nama_transporter}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">No. Polisi *</label>
                <input type="text" className="form-input uppercase" value={noPolisi} onChange={(e) => setNoPolisi(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Jenis Kendaraan *</label>
                <select className="form-select" value={jenisKendaraanId} onChange={(e) => setJenisKendaraanId(e.target.value)} required>
                  <option value="">Pilih Jenis Kendaraan</option>
                  {jenisKendaraan.map((j) => (
                    <option key={j.id} value={j.id}>{j.nama}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label">Nama Supir *</label>
                <select className="form-select" value={driverId} onChange={(e) => setDriverId(e.target.value)} required>
                  <option value="">Pilih Supir</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>{d.nama_supir}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">No. SIM</label>
                <input type="text" className="form-input bg-slate-50 dark:bg-white/5" value={allDrivers.find((d) => String(d.id) === driverId)?.no_sim || ""} readOnly />
              </div>
              <div>
                <label className="form-label">Berlaku SIM</label>
                <input 
                  type="text" 
                  className="form-input bg-slate-50 dark:bg-white/5" 
                  value={(() => {
                    const d = allDrivers.find(d => String(d.id) === driverId);
                    return d?.tgl_berlaku_sim ? d.tgl_berlaku_sim.split('T')[0] : "";
                  })()} 
                  readOnly 
                  placeholder="Terisi otomatis" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Tipe Kendaraan</label>
                  <select className="form-select uppercase" value={tipeKendaraan} onChange={(e) => setTipeKendaraan(e.target.value as any)}>
                    <option value="">—</option>
                    <option value="bak_terbuka">Bak Terbuka</option>
                    <option value="tangki">Tangki</option>
                    <option value="umum">Umum</option>
                    <option value="box">Box</option>
                    <option value="container">Container</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Tahun</label>
                  <input 
                    type="number" 
                    className={`form-input ${error.includes("Tahun kendaraan") ? 'border-red-500 bg-red-50' : ''}`} 
                    value={tahunKendaraan} 
                    onChange={(e) => {
                      setTahunKendaraan(e.target.value);
                      if (error.includes("Tahun kendaraan")) setError("");
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="form-label">Tujuan</label>
              <input type="text" className="form-input" value={tujuan} onChange={(e) => setTujuan(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Keterangan</label>
              <input type="text" className="form-input" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Kelengkapan supir */}
        <div className="glass-card p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Pemeriksaan Kelengkapan Supir</h2>
              <p className="text-sm text-text-muted">Wajib diisi semua item (Ya/Tidak).</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {Object.values(checklist).filter((v) => v !== null && typeof v !== "undefined").length}/{checklistItems.length || 0} terisi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {checklistItems.map((item) => {
              const val = checklist[item.id];
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border transition-all"
                  style={{
                    background: val === true ? "rgba(16,185,129,0.06)" : val === false ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.02)",
                    borderColor: val === true ? "rgba(16,185,129,0.25)" : val === false ? "rgba(239,68,68,0.25)" : "var(--border)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text-primary dark:text-slate-200 truncate">{item.nama_item}</p>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        Status: <span className="font-semibold">{val === null || typeof val === "undefined" ? "Belum dipilih" : val ? "Ya" : "Tidak"}</span>
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setChecklist((p) => ({ ...p, [item.id]: true }))}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${val === true ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white/0 border-border text-slate-500 hover:border-emerald-500/50"}`}
                      >
                        Ya
                      </button>
                      <button
                        type="button"
                        onClick={() => setChecklist((p) => ({ ...p, [item.id]: false }))}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${val === false ? "bg-rose-500 border-rose-500 text-white" : "bg-white/0 border-border text-slate-500 hover:border-rose-500/50"}`}
                      >
                        Tidak
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Muatan Dibawa / Diisi */}
        {(isUnloadingKegiatan || isLoadingKegiatan) && muatanItems.length > 0 && (
          <div className="glass-card p-8 shadow-sm">
            <h2 className="text-xl font-bold text-text-primary mb-6">
              {isUnloadingKegiatan ? "Muatan yang Dibawa" : "Muatan yang Diisi"}
            </h2>
            <div className="space-y-3">
              {muatanItems
                .filter(m => isUnloadingKegiatan ? (m.jenis === "dibawa" || m.jenis === "both") : (m.jenis === "diisi" || m.jenis === "both"))
                .map(m => {
                  const entry = isUnloadingKegiatan ? muatanDibawa[m.id] : muatanDiisi[m.id];
                  const setFn = isUnloadingKegiatan ? setMuatanDibawa : setMuatanDiisi;
                  return (
                    <div key={m.id} className="p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-text-primary dark:text-slate-300 text-sm">{m.nama_item}</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setFn(p => ({ ...p, [m.id]: { checked: true, nilai: "1" } }))}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${entry?.checked && entry?.nilai !== "0" ? "bg-emerald-500 text-white" : "bg-bg-secondary dark:bg-white/10 text-text-muted border border-slate-100 dark:border-white/10"}`}
                          >Ya</button>
                          <button
                            type="button"
                            onClick={() => setFn(p => ({ ...p, [m.id]: { checked: true, nilai: "0" } }))}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${entry?.checked && entry?.nilai === "0" ? "bg-rose-500 text-white" : "bg-bg-secondary dark:bg-white/10 text-text-muted border border-slate-100 dark:border-white/10"}`}
                          >Tidak</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button type="button" onClick={() => router.push(`/vcf/${vcfId}`)} className="btn btn-secondary px-8">
            Batal
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary px-12 py-4 text-lg">
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}

