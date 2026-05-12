"use client";

import { useState, useEffect } from "react";
import { masterApi } from "@/lib/api";
import PrintTemplate from "@/components/print/PrintTemplate";
import { CK, UL, QRCodeSign, PRINT_STYLES } from "@/components/print/PrintElements";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
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
  driver?: { nama_supir: string; no_sim: string; jenis_sim?: string; tgl_berlaku_sim?: string };
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
  keterangan?: string;
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

interface Props {
  vcf: VcfDetail;
  onClose: () => void;
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function PrintVCF({ vcf, onClose }: Props) {
  // Master Data State
  const [masterJenis, setMasterJenis] = useState<{ id: number; nama: string }[]>([]);
  const [masterProduk, setMasterProduk] = useState<{ id: number; nama: string }[]>([]);
  const [masterKS, setMasterKS] = useState<{ id: number; nama_item: string }[]>([]);
  const [masterMuatan, setMasterMuatan] = useState<{ id: number; nama_item: string }[]>([]);
  const [masterPM, setMasterPM] = useState<{ id: number; nama_item: string; kode?: string }[]>([]);
  const [masterPK, setMasterPK] = useState<{ id: number; nama_item: string; kode?: string }[]>([]);

  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const [resJ, resP, resKS, resM, resPM, resPK] = await Promise.all([
          masterApi.getJenisKendaraan({ is_active: 1 }),
          masterApi.getProduk({ is_active: 1 }),
          masterApi.getItemKelengkapanSupir({ is_active: 1 }),
          masterApi.getItemMuatan({ is_active: 1 }),
          masterApi.getItemPemeriksaanMasuk({ is_active: 1 }),
          masterApi.getItemPemeriksaanKeluar({ is_active: 1 }),
        ]);
        setMasterJenis(resJ.data.data || resJ.data);
        setMasterProduk(resP.data.data || resP.data);
        setMasterKS(resKS.data.data || resKS.data);
        setMasterMuatan(resM.data.data || resM.data);
        setMasterPM(resPM.data.data || resPM.data);
        setMasterPK(resPK.data.data || resPK.data);
      } catch (err) {
        console.error("Failed to fetch master data for printing", err);
      }
    };
    fetchMaster();
  }, []);

  /* ── helper: mapping logic ── */
  const tipe = (vcf.tipe_kegiatan ?? "").toLowerCase();
  const isLoading = tipe.includes("loading") && !tipe.includes("unloading");
  const isUnloading = tipe.includes("unloading");

  const asal = (vcf.asal_tujuan ?? "").toLowerCase();
  const isLokal = asal.includes("lokal") || tipe.includes("lokal");
  const isExport = asal.includes("export") || tipe.includes("export");
  const isImport = asal.includes("import") || tipe.includes("import");

  const vcfProduk = vcf.produk ?? "";
  const vcfProdukList = vcfProduk.split(/[,;]+/).map(s => s.trim()).filter(Boolean);
  const hasProduk = (nama: string) => vcfProdukList.some(p => p.toLowerCase() === nama.toLowerCase() || p.toLowerCase().includes(nama.toLowerCase()));
  const othersEntry = vcfProdukList.find(p => p.toUpperCase().startsWith("OTHERS:") || p.toUpperCase().startsWith("OTHER:"));
  const othersVal = othersEntry ? othersEntry.split(":").slice(1).join(":").trim() : "";

  /* find check items by keyword or ID */
  const findKS = (k: string) => vcf.kelengkapan_supir?.find(i => i.item?.nama_item?.toLowerCase().includes(k.toLowerCase()));
  const findPM = (k: string) => vcf.pemeriksaan_masuk?.find(i => i.item?.nama_item?.toLowerCase().includes(k.toLowerCase()));
  const findPK = (k: string) => vcf.pemeriksaan_keluar?.find(i => i.item?.nama_item?.toLowerCase().includes(k.toLowerCase()));
  const findPKById = (id: number) => vcf.pemeriksaan_keluar?.find(i => i.item_id === id);

  const pmTangki = findPM("kondisi tangki") || findPM("tangki");
  const pmValve = findPM("valve") || findPM("penutup");

  const isValveAda = pmValve?.nilai === "Ada" || pmValve?.nilai === "Ya" || pmValve?.nilai === "1" || pmValve?.nilai === "Terpasang";
  const isValveTidak = pmValve?.nilai === "Tidak" || pmValve?.nilai === "0" || pmValve?.nilai === "Tidak Ada";

  const pkValve = findPK("valve") || findPK("penutup");
  const isPkValveAda = pkValve?.nilai === "Ada" || pkValve?.nilai === "Ya" || pkValve?.nilai === "1" || pkValve?.nilai === "Terpasang";
  const isPkValveTidak = pkValve?.nilai === "Tidak" || pkValve?.nilai === "0" || pkValve?.nilai === "Tidak Ada";

  const btmAda = vcf.beban_tambahan_masuk?.ada || findPM("beban")?.nilai === "Ada";
  const segelMasukAda = (vcf.segel_masuk?.jumlah_segel ?? 0) > 0 || findPM("segel")?.nilai === "Terpasang";

  const pkTangki = findPK("kondisi tangki") || findPK("tangki");
  const btkAda = vcf.beban_tambahan_keluar?.ada || findPK("beban")?.nilai === "Ada";
  const segelKeluarAda = (vcf.segel_keluar?.jumlah_segel ?? 0) > 0 || findPK("segel")?.nilai === "Terpasang";

  const formatVal = (val: string) => {
    if (!val || val === "" || val === "0" || val.toLowerCase() === "tidak") return "-";
    if (val === "1") return "Ya";
    return val;
  };

  const getMD = (id: number) => formatVal(vcf.muatan_dibawa?.find(m => m.item_muatan_id === id || m.item_muatan?.id === id)?.nilai || "");
  const getMI = (id: number) => formatVal(vcf.muatan_diisi?.find(m => m.item_muatan_id === id || m.item_muatan?.id === id)?.nilai || "");

  return (
    <PrintTemplate 
      title="Vehicle Control Form ( VCF )" 
      subtitle={`No. ${vcf.nomor_urut}`} 
      onClose={onClose}
    >
      {/* ── INFO UMUM ── */}
      <table style={{ width: "100%" }}>
        <colgroup><col style={{ width: "38%" }} /><col style={{ width: "28%" }} /><col style={{ width: "34%" }} /></colgroup>
        <tbody>
          <tr>
            <td style={PRINT_STYLES.CELL}>
              <strong>NOMOR URUT</strong>: <UL w={110} val={vcf.nomor_urut} /><br />
              <div style={{ marginTop: 2 }}><strong>TANGGAL</strong>: <UL w={110} val={vcf.tanggal} /></div>
            </td>
            <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}>
              <strong>LOGISTIK</strong><br />
              <div style={{ marginTop: 2 }}><CK checked={isLoading} label="LOADING" /><CK checked={isUnloading} label="UNLOADING" /></div>
            </td>
            <td style={PRINT_STYLES.CELL}>
              <CK checked={isLokal} label="LOKAL" /><CK checked={isExport} label="EXPORT" /><br />
              <div style={{ marginTop: 2 }}><CK checked={isImport} label="IMPORT" /></div>
            </td>
          </tr>
          <tr>
            <td colSpan={3} style={PRINT_STYLES.CELL}>
              {masterProduk.length > 0 ? (
                masterProduk.map(p => (
                  <CK key={p.id} checked={hasProduk(p.nama)} label={p.nama} />
                ))
              ) : (
                <>
                  <CK checked={hasProduk("CPO")} label="CPO" />
                  <CK checked={hasProduk("RBDPO")} label="RBDPO" />
                  <CK checked={hasProduk("RBDOL")} label="RBDOL" />
                  <CK checked={hasProduk("RBDST")} label="RBDST" />
                  <CK checked={hasProduk("PFAD")} label="PFAD" />
                </>
              )}
              <span style={{ marginLeft: 10 }}>Others: <UL w={90} val={othersVal} /></span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Tabel 1a: Info Kendaraan & Pemeriksaan Kelengkapan Supir ── */}
      <div style={PRINT_STYLES.HDR}>1. Diisi Oleh Security Main Gate</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <colgroup>
          <col style={{ width: "40%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "36%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={2} style={PRINT_STYLES.CELL}><strong>Transporter</strong>: {vcf.transporter?.nama_transporter || <UL w={120} />}</td>
            <td colSpan={2} style={PRINT_STYLES.CELL}><strong>Jam Masuk</strong>: <UL w={60} val={vcf.jam_masuk} /> WIB</td>
          </tr>
          <tr>
            <td colSpan={2} style={PRINT_STYLES.CELL}><strong>No. Polisi</strong>: {vcf.no_polisi || <UL w={80} />}</td>
            <td colSpan={2} style={PRINT_STYLES.CELL}>
              <strong>Tipe</strong>:{" "}
              {masterJenis.length > 0 ? (
                masterJenis.map(j => (
                  <CK key={j.id} checked={vcf.jenis_kendaraan_id === j.id || vcf.jenis_kendaraan?.id === j.id} label={j.nama} />
                ))
              ) : (
                <>
                  <CK checked={vcf.tipe_kendaraan?.toLowerCase().includes("bak")} label="BAK" />
                  <CK checked={vcf.tipe_kendaraan?.toLowerCase().includes("tangki")} label="TANGKI" />
                  <CK checked={vcf.tipe_kendaraan?.toLowerCase().includes("box")} label="BOX" />
                  <CK checked={vcf.tipe_kendaraan?.toLowerCase().includes("cont")} label="CONT" />
                </>
              )}
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={PRINT_STYLES.CELL}><strong>Nama Supir</strong>: {vcf.driver?.nama_supir || <UL w={120} />}</td>
            <td colSpan={2} style={PRINT_STYLES.CELL}><strong>Tahun Unit</strong>: <UL w={60} val={vcf.tahun_kendaraan} /></td>
          </tr>
          <tr>
            <td colSpan={2} style={PRINT_STYLES.CELL}>
              <strong>SIM Supir</strong>: <UL w={80} val={vcf.driver?.no_sim} /> ( <UL w={30} val={vcf.driver?.jenis_sim} /> )
              {vcf.driver?.tgl_berlaku_sim && (
                <span style={{ marginLeft: 8, fontSize: 8 }}>
                  Berlaku s/d: <UL w={60} val={vcf.driver.tgl_berlaku_sim.split('T')[0]} />
                </span>
              )}
            </td>
            <td colSpan={2} style={PRINT_STYLES.CELL}></td>
          </tr>

          {/* Sub-header kelengkapan supir */}
          <tr>
            <td colSpan={4} style={{ ...PRINT_STYLES.SUB_HDR, padding: "5px 8px 3px", fontSize: 9 }}>Pemeriksaan Kelengkapan Supir</td>
          </tr>
          {masterKS.length > 0 ? (
            masterKS.map((item, i) => {
              const ks = vcf.kelengkapan_supir?.find(val => val.item_id === item.id);
              const isYes = ks?.nilai === true || ks?.nilai === 1 || ks?.nilai === "1" || String(ks?.nilai).toLowerCase() === "ya";
              const isNo  = ks?.nilai === false || ks?.nilai === 0 || ks?.nilai === "0" || String(ks?.nilai).toLowerCase() === "tidak";
              const exLbl = i === 0 ? "Tujuan" : "";
              const exVal = i === 0 ? vcf.asal_tujuan : "";
              return (
                <tr key={item.id}>
                  <td style={PRINT_STYLES.CELL}>{i + 1}. {item.nama_item}</td>
                  <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={isYes} label="Ya" /></td>
                  <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={isNo} label="Tidak" /></td>
                  <td style={PRINT_STYLES.CELL}>{exLbl ? <span><strong>{exLbl}</strong>: <UL w={110} val={exVal || "-"} /></span> : ""}</td>
                </tr>
              );
            })
          ) : (
            [
              { lbl: "1) SPB / DO", kw: "spb", ex: "Tujuan", val: vcf.asal_tujuan },
              { lbl: "2) Seragam", kw: "seragam" },
              { lbl: "3) Sepatu & Helm", kw: "sepatu" },
              { lbl: "4) ID Card / Visitor", kw: "id card" },
            ].map((item, i) => {
              const ks = findKS(item.kw);
              const isYes = ks?.nilai === true || ks?.nilai === 1 || ks?.nilai === "1" || String(ks?.nilai).toLowerCase() === "ya";
              const isNo  = ks?.nilai === false || ks?.nilai === 0 || ks?.nilai === "0" || String(ks?.nilai).toLowerCase() === "tidak";
              return (
                <tr key={i}>
                  <td style={PRINT_STYLES.CELL}>{item.lbl}</td>
                  <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={isYes} label="Ya" /></td>
                  <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={isNo} label="Tidak" /></td>
                  <td style={PRINT_STYLES.CELL}>{item.ex ? <span><strong>{item.ex}</strong>: <UL w={110} val={item.val || "-"} /></span> : ""}</td>
                </tr>
              );
            })
          )}

        </tbody>
      </table>

      {/* ── Tabel Jenis Muatan — colgroup sendiri ── */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <colgroup>
          <col style={{ width: "40%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "30%" }} />
          <col style={{ width: "14%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={4} style={PRINT_STYLES.SUB_HDR}>Jenis Muatan</td>
          </tr>
          <tr>
            <td colSpan={2} style={{ ...PRINT_STYLES.SUB_HDR, background: "#f0f0f0", fontSize: 8 }}>Muatan yang Dibawa (Unloading)</td>
            <td colSpan={2} style={{ ...PRINT_STYLES.SUB_HDR, background: "#f0f0f0", fontSize: 8 }}>Muatan yang Akan Diisi (Loading)</td>
          </tr>
          {(() => {
            const dibawa = masterMuatan.length > 0
              ? masterMuatan.filter(m => (m as any).jenis !== "diisi" && (m as any).jenis !== "loading_only")
              : ["Minyak", "Fuel", "Sparepart", "Lainnya"].map((k, idx) => ({ id: -(idx + 1), nama_item: k, _fallback: k }));
            const diisi = masterMuatan.length > 0
              ? masterMuatan.filter(m => (m as any).jenis !== "dibawa" && (m as any).jenis !== "unloading_only")
              : ["Minyak", "Limbah", "Lainnya"].map((k, idx) => ({ id: -(idx + 100), nama_item: k, _fallback: k }));
            const maxRows = Math.max(dibawa.length, diisi.length);
            return Array.from({ length: maxRows }).map((_, i) => {
              const md = dibawa[i] as any;
              const mi = diisi[i] as any;
              const mdVal = md ? (md._fallback
                ? formatVal(vcf.muatan_dibawa?.find(m => (m.item_muatan?.nama_item ?? m.nama_item ?? "").toLowerCase().includes(md._fallback.toLowerCase()))?.nilai || "")
                : getMD(md.id)) : "";
              const miVal = mi ? (mi._fallback
                ? formatVal(vcf.muatan_diisi?.find(m => (m.item_muatan?.nama_item ?? m.nama_item ?? "").toLowerCase().includes(mi._fallback.toLowerCase()))?.nilai || "")
                : getMI(mi.id)) : "";
              const mdIsYes = mdVal !== "-" && mdVal !== "";
              const miIsYes = miVal !== "-" && miVal !== "";
              return (
                <tr key={i}>
                  <td style={PRINT_STYLES.CELL}>{md ? `${i + 1}. ${md.nama_item}` : ""}</td>
                  <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}>
                    {md && <><CK checked={mdIsYes} label="Ada" /><CK checked={!mdIsYes} label="Tidak" /></>}
                    {md && mdVal !== "-" && mdVal !== "" && mdVal !== "Ya" && <UL w={50} val={mdVal} />}
                  </td>
                  <td style={PRINT_STYLES.CELL}>{mi ? `${i + 1}. ${mi.nama_item}` : ""}</td>
                  <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}>
                    {mi && <><CK checked={miIsYes} label="Ada" /><CK checked={!miIsYes} label="Tidak" /></>}
                    {mi && miVal !== "-" && miVal !== "" && miVal !== "Ya" && <UL w={50} val={miVal} />}
                  </td>
                </tr>
              );
            });
          })()}
        </tbody>
      </table>

      {/* ── Keterangan + QR Petugas Main Gate — paling bawah section 1 ── */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <colgroup>
          <col style={{ width: "50%" }} />
          <col style={{ width: "50%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td style={{ ...PRINT_STYLES.CELL, fontStyle: "italic", verticalAlign: "middle" }}>
              Keterangan: <UL w={200} val={vcf.keterangan && vcf.keterangan !== "-" ? vcf.keterangan : vcf.catatan} />
            </td>
            <td style={{ ...PRINT_STYLES.CELL, textAlign: "center", padding: "3px" }}>
              <QRCodeSign
                nama={vcf.nama_petugas_main_gate_masuk || vcf.created_by?.nama}
                timestamp={vcf.created_at}
                label="Petugas Main Gate"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div style={PRINT_STYLES.HDR}>2. Diisi Oleh Security Weighbridge ( Masuk )</div>
      <table style={{ width: "100%" }}>
        <colgroup>
          <col style={{ width: "40%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "36%" }} />
        </colgroup>
        <tbody>
          {masterPM.length > 0 ? (
            masterPM.map((item, i) => {
              const pm = vcf.pemeriksaan_masuk?.find(p => p.item_id === item.id);
              const val = (pm?.nilai ?? "").toLowerCase();
              const isPos = ["ya", "ada", "bagus", "baik", "terpasang", "1"].includes(val);
              const isNeg = ["tidak", "tidak ada", "rusak", "sisa", "0"].includes(val);
              const nm = item.nama_item?.toLowerCase() ?? "";
              const isBTK = item.kode === "BTK" || nm.includes("beban");
              const isSGL = item.kode === "SGK" || item.kode === "SGL" || nm.includes("segel");
              return (
                <tr key={item.id}>
                  <td style={PRINT_STYLES.CELL}>{String.fromCharCode(97 + i)}. {item.nama_item}</td>
                  <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={isPos || (isBTK && btmAda) || (isSGL && segelMasukAda)} label="Ada / Ya" /></td>
                  <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={isNeg || (isBTK && !btmAda) || (isSGL && !segelMasukAda)} label="Tidak" /></td>
                  <td style={PRINT_STYLES.CELL}>
                    {isBTK && <span>Jenis: <UL w={100} val={vcf.beban_tambahan_masuk?.jenis_beban} /></span>}
                    {isSGL && <span>Jml: {vcf.segel_masuk?.jumlah_segel || 0} &nbsp; No: <UL w={70} val={vcf.segel_masuk?.nomor_segel?.map(s => s.nomor_segel).join(", ")} /></span>}
                    {pm?.keterangan && !isBTK && !isSGL && <span>{pm.keterangan}</span>}
                  </td>
                </tr>
              );
            })
          ) : (
            <>
              <tr>
                <td style={PRINT_STYLES.CELL}>a. Kondisi Tangki</td>
                <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={pmTangki?.nilai === "Bagus" || pmTangki?.nilai === "Baik"} label="Bagus" /></td>
                <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={pmTangki?.nilai === "Rusak" || pmTangki?.nilai === "Tidak"} label="Rusak" /></td>
                <td style={PRINT_STYLES.CELL}>Jenis: <UL w={100} val={vcf.beban_tambahan_masuk?.jenis_beban} /></td>
              </tr>
              <tr>
                <td style={PRINT_STYLES.CELL}>b. Penutup Valve</td>
                <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={isValveAda} label="Ada" /></td>
                <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={isValveTidak} label="Tidak" /></td>
                <td style={PRINT_STYLES.CELL}>Jml: {vcf.segel_masuk?.jumlah_segel || 0} &nbsp; No: <UL w={70} val={vcf.segel_masuk?.nomor_segel?.map(s => s.nomor_segel).join(", ")} /></td>
              </tr>
              <tr>
                <td style={PRINT_STYLES.CELL}>c. Beban Tambahan</td>
                <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={btmAda} label="Ada" /></td>
                <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={!btmAda} label="Tidak" /></td>
                <td style={PRINT_STYLES.CELL}></td>
              </tr>
              <tr>
                <td style={PRINT_STYLES.CELL}>d. Segel</td>
                <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={segelMasukAda} label="Ada" /></td>
                <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={!segelMasukAda} label="Tidak" /></td>
                <td style={PRINT_STYLES.CELL}></td>
              </tr>
            </>
          )}
          <tr>
            <td colSpan={3} style={{ ...PRINT_STYLES.CELL, fontStyle: "italic" }}>Keterangan: <UL w={200} val={vcf.vcf_bagian2?.keterangan} /></td>
            <td style={{ ...PRINT_STYLES.CELL, textAlign: "center", padding: "3px" }}>
              <QRCodeSign
                nama={vcf.nama_petugas_wb_masuk || vcf.pemeriksaan_masuk?.[0]?.petugas?.nama || vcf.segel_masuk?.petugas?.nama}
                timestamp={vcf.pemeriksaan_masuk?.[0]?.waktu_input || vcf.pemeriksaan_masuk?.[0]?.created_at || vcf.segel_masuk?.created_at}
                label="Petugas WB Masuk"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div style={PRINT_STYLES.HDR}>3. Diisi Oleh Security Weighbridge ( Keluar )</div>
      <table style={{ width: "100%" }}>
        <colgroup>
          <col style={{ width: "40%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "36%" }} />
        </colgroup>
        <tbody>
          {masterPK.length > 0 ? (
            masterPK.map((item, i) => {
              const pk = findPKById(item.id);
              const val = (pk?.nilai ?? "").toLowerCase();
              const isPos = ["ya", "ada", "bagus", "baik", "terpasang", "1"].includes(val);
              const isNeg = ["tidak", "tidak ada", "rusak", "sisa", "0", "tidak terpasang"].includes(val);
              const nm = item.nama_item?.toLowerCase() ?? "";
              const isBTK = item.kode === "BTK" || nm.includes("beban");
              const isSGL = item.kode === "SGK" || item.kode === "SGL" || nm.includes("segel");
              return (
                <tr key={item.id}>
                  <td style={PRINT_STYLES.CELL}>{String.fromCharCode(97 + i)}. {item.nama_item}</td>
                  <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={isPos || (isBTK && btkAda) || (isSGL && segelKeluarAda)} label="Ada / Ya" /></td>
                  <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={isNeg || (isBTK && !btkAda) || (isSGL && !segelKeluarAda)} label="Tidak" /></td>
                  <td style={PRINT_STYLES.CELL}>
                    {isBTK && <span>Jenis: <UL w={100} val={vcf.beban_tambahan_keluar?.jenis_beban} /></span>}
                    {isSGL && <span>Jml: {vcf.segel_keluar?.jumlah_segel || 0} &nbsp; No: <UL w={70} val={vcf.segel_keluar?.nomor_segel?.map(s => s.nomor_segel).join(", ")} /></span>}
                    {pk?.keterangan && !isBTK && !isSGL && <span>{pk.keterangan}</span>}
                  </td>
                </tr>
              );
            })
          ) : (
            <>
              <tr>
                <td style={PRINT_STYLES.CELL}>a. Kondisi Tangki</td>
                <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={pkTangki?.nilai === "Baik" || pkTangki?.nilai === "Kosong"} label="Baik/Kosong" /></td>
                <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={pkTangki?.nilai === "Rusak" || pkTangki?.nilai === "Sisa"} label="Rusak/Sisa" /></td>
                <td style={PRINT_STYLES.CELL}></td>
              </tr>
              <tr>
                <td style={PRINT_STYLES.CELL}>b. Penutup Valve</td>
                <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={isPkValveAda} label="Ada" /></td>
                <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={isPkValveTidak} label="Tidak" /></td>
                <td style={PRINT_STYLES.CELL}>Jenis: <UL w={100} val={vcf.beban_tambahan_keluar?.jenis_beban} /></td>
              </tr>
              <tr>
                <td style={PRINT_STYLES.CELL}>c. Beban Tambahan</td>
                <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={btkAda} label="Ada" /></td>
                <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={!btkAda} label="Tidak" /></td>
                <td style={PRINT_STYLES.CELL}>Jml: {vcf.segel_keluar?.jumlah_segel || 0} &nbsp; No: <UL w={70} val={vcf.segel_keluar?.nomor_segel?.map(s => s.nomor_segel).join(", ")} /></td>
              </tr>
              <tr>
                <td style={PRINT_STYLES.CELL}>d. Segel</td>
                <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={segelKeluarAda} label="Ada" /></td>
                <td style={{ ...PRINT_STYLES.CELL, textAlign: "center" }}><CK checked={!segelKeluarAda} label="Tidak" /></td>
                <td style={PRINT_STYLES.CELL}></td>
              </tr>
            </>
          )}
          <tr>
            <td colSpan={3} style={{ ...PRINT_STYLES.CELL, fontStyle: "italic" }}>Keterangan: <UL w={200} val={vcf.vcf_bagian3?.keterangan} /></td>
            <td style={{ ...PRINT_STYLES.CELL, textAlign: "center", padding: "3px" }}>
              <QRCodeSign
                nama={vcf.nama_petugas_wb_keluar || vcf.pemeriksaan_keluar?.[0]?.petugas?.nama || vcf.segel_keluar?.petugas?.nama}
                timestamp={vcf.pemeriksaan_keluar?.[0]?.waktu_input || vcf.pemeriksaan_keluar?.[0]?.created_at || vcf.segel_keluar?.created_at}
                label="Petugas WB Keluar"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div style={PRINT_STYLES.HDR}>4. Diisi Oleh Security Main Gate</div>
      <table style={{ width: "100%" }}>
        <colgroup><col style={{ width: "50%" }} /><col style={{ width: "50%" }} /></colgroup>
        <tbody>
          <tr>
            <td style={PRINT_STYLES.CELL}><strong>Jam Keluar</strong>: <UL w={80} val={vcf.vcf_keluar?.jam_keluar} /> WIB</td>
            <td style={PRINT_STYLES.CELL}><strong>Emergency Respon</strong>: <UL w={110} val={vcf.vcf_keluar?.emergency_respon_kontak} /></td>
          </tr>
          <tr>
            <td style={{ ...PRINT_STYLES.CELL, fontStyle: "italic" }}>Keterangan: <UL w={240} val={vcf.vcf_keluar?.keterangan} /></td>
            <td style={{ ...PRINT_STYLES.CELL, textAlign: "center", padding: "3px" }}>
              <QRCodeSign 
                nama={vcf.nama_petugas_main_gate_keluar || vcf.vcf_keluar?.petugas?.nama} 
                timestamp={vcf.vcf_keluar?.waktu_input || vcf.vcf_keluar?.created_at}
                label="Petugas Main Gate" 
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: 3, fontSize: 7, fontStyle: "italic" }}>
        Lembar : 1. WB (Putih), 2. Security (Kuning)
      </div>
    </PrintTemplate>
  );
}
