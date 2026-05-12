"use client";

import { useState, useEffect, useCallback } from "react";
import { masterApi } from "@/lib/api";
import { clearMasterDataCache } from "@/lib/masterDataCache";
import { exportToExcel } from "@/lib/exportUtils";
import * as XLSX from 'xlsx';
import PrintMasterTable from "@/components/print/PrintMasterTable";
import { downloadImportTemplate, parseAndImportExcel } from "@/lib/importTemplate";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

interface Produk {
  id: number;
  nama: string;
  kode: string;
  keterangan: string;
  warna_nomor_urut: string;
  is_active: boolean;
}

const WARNA_OPTIONS = [
  { value: "hitam", label: "Hitam", hex: "#1f2937" },
  { value: "merah", label: "Merah", hex: "#ef4444" },
  { value: "biru", label: "Biru", hex: "#3b82f6" },
  { value: "hijau", label: "Hijau", hex: "#22c55e" },
  { value: "kuning", label: "Kuning", hex: "#eab308" },
  { value: "ungu", label: "Ungu", hex: "#a855f7" },
  { value: "orange", label: "Orange", hex: "#f97316" },
];

export default function ProdukPage() {
  const [data, setData] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Produk | null>(null);
  const [form, setForm] = useState({ nama: "", kode: "", keterangan: "", warna_nomor_urut: "hitam", is_active: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      const res = await masterApi.getProduk(params);
      setData(res.data.data || res.data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData, debouncedSearch]);

  const openCreate = () => {
    setEditing(null);
    setForm({ nama: "", kode: "", keterangan: "", warna_nomor_urut: "hitam", is_active: true });
    setError("");
    setShowModal(true);
  };

  const openEdit = (item: Produk) => {
    setEditing(item);
    setForm({
      nama: item.nama,
      kode: item.kode,
      keterangan: item.keterangan || "",
      warna_nomor_urut: item.warna_nomor_urut || "hitam",
      is_active: !!item.is_active,
    });
    setError("");
    setShowModal(true);
  };

  const handleToggleActive = async (item: Produk) => {
    try {
      await masterApi.updateProduk(item.id, { is_active: !item.is_active });
      clearMasterDataCache();
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal mengubah status.");
    }
  };

  const handleDeleteClick = (id: number) => { setDeleteId(id); setShowDeleteModal(true); };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await masterApi.deleteProduk(deleteId);
      clearMasterDataCache();
      setShowDeleteModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menghapus data.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, keterangan: form.keterangan.trim() || "-" };
      if (editing) {
        await masterApi.updateProduk(editing.id, payload);
      } else {
        await masterApi.createProduk(payload);
      }
      clearMasterDataCache();
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan data.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Master Data — Produk</h1>
          <p className="page-subtitle">Kelola daftar produk / komoditas kendaraan</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Import */}
          <div className="relative group">
            <button className="btn btn-secondary flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              <span>Import</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div className="absolute right-0 mt-1 w-52 border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50" style={{ background: "var(--bg-secondary)" }}>
              <button onClick={() => downloadImportTemplate("Produk", ["kode *", "nama *", "keterangan", "warna_nomor_urut", "is_active (Ya/Tidak)"], [
                ["CPO", "Crude Palm Oil", "Minyak sawit mentah", "hitam", "Ya"],
                ["RBDPO", "Refined Bleached Deodorized Palm Oil", "Minyak sawit olahan", "biru", "Ya"],
                ["PFAD", "Palm Fatty Acid Distillate", "Produk samping", "merah", "Ya"]
              ])} className="w-full text-left px-4 py-2 text-sm hover:bg-bg-card-hover first:rounded-t-xl flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                Unduh Template (.xlsx)
              </button>
              <label className="w-full text-left px-4 py-2 text-sm hover:bg-bg-card-hover last:rounded-b-xl flex items-center gap-2 cursor-pointer" style={{ color: "var(--text-primary)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Upload File Excel
                <input type="file" accept=".xlsx,.xls" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  e.target.value = "";
                  const result = await parseAndImportExcel(
                    file,
                    (row) => {
                      const kode = String(row["kode *"] ?? row["kode"] ?? "").trim();
                      const nama = String(row["nama *"] ?? row["nama"] ?? "").trim();
                      if (!kode || !nama) return null;
                      return {
                        kode,
                        nama,
                        keterangan: String(row["keterangan"] ?? "").trim() || null,
                        warna_nomor_urut: String(row["warna_nomor_urut"] ?? "hitam").trim(),
                        is_active: String(row["is_active (Ya/Tidak)"] ?? row["is_active"] ?? "Ya").trim().toLowerCase() !== "tidak",
                      };
                    },
                    (data) => masterApi.createProduk(data)
                  );
                  clearMasterDataCache();
                  fetchData();
                  alert(`Import selesai: ${result.success} berhasil, ${result.failed} gagal.${result.errors.length ? "\n\nDetail:\n" + result.errors.slice(0, 5).join("\n") : ""}`);
                }} />
              </label>
            </div>
          </div>
          {/* Export */}
          <div className="relative group">
            <button className="btn btn-secondary flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              <span>Export</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div className="absolute right-0 mt-1 w-44 border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50" style={{ background: "var(--bg-secondary)" }}>
              <button onClick={() => exportToExcel("Data_Produk", ["Kode","Nama","Keterangan","Warna","Status"], data.map(i => [i.kode,i.nama,i.keterangan,i.warna_nomor_urut,i.is_active?"Aktif":"Nonaktif"]))} className="w-full text-left px-4 py-2 text-sm hover:bg-bg-card-hover first:rounded-t-xl" style={{ color: "var(--text-primary)" }}>Excel (.xlsx)</button>
              <button onClick={() => setIsPrinting(true)} className="w-full text-left px-4 py-2 text-sm hover:bg-bg-card-hover last:rounded-b-xl" style={{ color: "var(--text-primary)" }}>Cetak / PDF</button>
            </div>
          </div>
          <button className="btn btn-primary flex items-center gap-2" onClick={openCreate}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          </div>
          <input type="text" placeholder="Cari nama atau kode produk..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl text-sm transition-all focus:outline-none"
            style={{ background: "var(--bg-secondary)", border: "1.5px solid var(--border)", color: "var(--text-primary)" }}
            onFocus={(e) => { e.currentTarget.style.border = "1.5px solid rgba(59,130,246,0.5)"; e.currentTarget.style.background = "var(--bg-card-hover)"; }}
            onBlur={(e) => { e.currentTarget.style.border = "1.5px solid var(--border)"; e.currentTarget.style.background = "var(--bg-secondary)"; }}
          />
        </div>
        <button className="btn btn-secondary" onClick={() => setSearch("")}>Reset</button>
      </div>

      <div className="glass-card overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="spinner" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-sm font-semibold text-secondary w-14 text-center">No.</th>
                <th className="px-6 py-4 text-sm font-semibold text-secondary">Kode</th>
                <th className="px-6 py-4 text-sm font-semibold text-secondary">Nama Produk</th>
                <th className="px-6 py-4 text-sm font-semibold text-secondary">Keterangan</th>
                <th className="px-6 py-4 text-sm font-semibold text-secondary text-center">Warna No. Urut</th>
                <th className="px-6 py-4 text-sm font-semibold text-secondary text-center">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-secondary text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted">Tidak ada data produk.</td></tr>
              ) : data.map((item, idx) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-bg-card-hover transition-colors group">
                  <td className="px-6 py-4 text-center text-xs text-secondary font-mono">{idx + 1}</td>
                  <td className="px-6 py-4 font-mono text-xs font-bold text-blue-400">{item.kode}</td>
                  <td className="px-6 py-4 font-medium text-text-primary dark:text-white">{item.nama}</td>
                  <td className="px-6 py-4 text-sm text-secondary">{item.keterangan || "—"}</td>
                  <td className="px-6 py-4 text-center">
                    {(() => {
                      const w = WARNA_OPTIONS.find(w => w.value === item.warna_nomor_urut);
                      const hex = w?.hex || "#6b7280";
                      return (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: hex + "22", border: `1px solid ${hex}55`, color: hex }}
                        >
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: hex }} />
                          {w?.label || item.warna_nomor_urut || "—"}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-200 focus:outline-none ${item.is_active ? "bg-green-500/20 border border-green-500/30" : "bg-red-500/20 border border-red-500/30"}`}
                      title={item.is_active ? "Klik untuk Nonaktifkan" : "Klik untuk Aktifkan"}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full transition-transform duration-200 ${item.is_active ? "translate-x-5 bg-green-400" : "translate-x-1 bg-red-400"}`} />
                    </button>
                    <p className={`text-[9px] mt-0.5 font-bold ${item.is_active ? "text-green-500/60" : "text-red-500/60"}`}>
                      {item.is_active ? "AKTIF" : "NONAKTIF"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(item)} className="w-9 h-9 flex items-center justify-center text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all" title="Edit">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button onClick={() => handleDeleteClick(item.id)} className="w-9 h-9 flex items-center justify-center text-red-400 hover:bg-red-400/10 rounded-xl transition-all" title="Hapus">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                {editing ? "Edit Produk" : "Tambah Produk"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ color: "var(--text-muted)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
            {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5" }}>⚠️ {error}</div>}
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="form-label">Kode Produk *</label>
                  <input type="text" className="form-input uppercase" required value={form.kode} onChange={(e) => setForm(p => ({ ...p, kode: e.target.value.toUpperCase() }))} placeholder="Contoh: CPO" />
                </div>
                <div>
                  <label className="form-label">Nama Produk *</label>
                  <input type="text" className="form-input" required value={form.nama} onChange={(e) => setForm(p => ({ ...p, nama: e.target.value }))} placeholder="Contoh: Crude Palm Oil" />
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label">Keterangan</label>
                <input type="text" className="form-input" value={form.keterangan} onChange={(e) => setForm(p => ({ ...p, keterangan: e.target.value }))} placeholder="Keterangan opsional" />
              </div>
              <div className="mb-4">
                <label className="form-label">Warna Nomor Urut</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {WARNA_OPTIONS.map(w => (
                    <button key={w.value} type="button" onClick={() => setForm(p => ({ ...p, warna_nomor_urut: w.value }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${form.warna_nomor_urut === w.value ? "border-blue-500 bg-blue-500/10" : "border-border"}`}
                      style={{ color: "var(--text-primary)" }}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ background: w.hex }} />
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6 flex items-center gap-3">
                <input type="checkbox" id="check-active-produk" checked={form.is_active} onChange={(e) => setForm(p => ({ ...p, is_active: e.target.checked }))} style={{ width: 16, height: 16 }} />
                <label htmlFor="check-active-produk" className="text-sm" style={{ color: "var(--text-secondary)" }}>Aktif</label>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" /> Menyimpan...</> : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        message="Menghapus produk akan mempengaruhi riwayat VCF. Lanjutkan?"
      />

      {isPrinting && (
        <PrintMasterTable
          title="Master Data — Produk"
          subtitle="Daftar produk / komoditas kendaraan"
          headers={["Kode", "Nama Produk", "Keterangan", "Warna No. Urut", "Status"]}
          data={data.map(i => [i.kode, i.nama, i.keterangan || "-", i.warna_nomor_urut, i.is_active ? "Aktif" : "Nonaktif"])}
          onClose={() => setIsPrinting(false)}
        />
      )}
    </div>
  );
}

