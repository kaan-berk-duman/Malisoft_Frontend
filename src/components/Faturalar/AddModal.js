import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const AddModal = ({ isOpen, onClose, onAddSuccess }) => {
  const { user } = useContext(AuthContext);
  const firmaId = user?.firma_id;

  const [formData, setFormData] = useState({
    fatura_no: "",
    cari_id: "",
    tarih: "",
    odeme_tipi: "",
    kdv_tutar: "",
    doviz_tipi: "",
    belge_turu: "",
    durum: "",
    genel_toplam: "",
    kalemler: [
      {
        birim: "",
        miktar: "",
        kdv_orani: "",
        birim_fiyat: "",
        kdv_tutar: "",
        genel_toplam: "",
        aciklama: "",
      },
    ],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch firma_kod and cari_id on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get firmalar list
        const firmalarRes = await axios.get("http://localhost:5127/api/firmalar/list");
        const firmalar = firmalarRes.data;
        // find current firma
        const firma = firmalar.find(f => f.firma_id === firmaId);
        const firmaKod = firma?.firma_kodu;

        if (!firmaKod) {
          throw new Error("Firma kodu bulunamadi");
        }

        // 2. Get cariler list
        const carilerRes = await axios.get("http://localhost:5127/api/cariler/list");
        const cariler = carilerRes.data;
        // find cari by cari_kod === firmaKod
        const cari = cariler.find(c => c.cari_kod === firmaKod);
        const cariId = cari?.cari_id;
        console.log(cariId)
        if (!cariId) {
          throw new Error("Cari bulunamadi");
        }

        // set cari_id in form
        setFormData(prev => ({ ...prev, cari_id: cariId }));
      } catch (err) {
        console.error(err);
        setError("Cari bilgisi getirilirken hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    if (firmaId) fetchData();
  }, [firmaId]);

  if (!isOpen) return null;
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">Yükleniyor...</div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleKalemChange = (idx, e) => {
    const { name, value } = e.target;
    const yeni = [...formData.kalemler];
    yeni[idx][name] = value;
    setFormData(prev => ({ ...prev, kalemler: yeni }));
  };

  const addKalem = () => {
    setFormData(prev => ({
      ...prev,
      kalemler: [
        ...prev.kalemler,
        {
          birim: "",
          miktar: "",
          kdv_orani: "",
          birim_fiyat: "",
          kdv_tutar: "",
          genel_toplam: "",
          aciklama: "",
        },
      ],
    }));
  };

  const removeKalem = (idx) => {
    setFormData(prev => ({
      ...prev,
      kalemler: prev.kalemler.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        Fatura: {
          fatura_no: formData.fatura_no,
          cari_id: formData.cari_id,
          tarih: formData.tarih,
          odeme_tipi: formData.odeme_tipi,
          doviz_tipi: formData.doviz_tipi,
          belge_turu: formData.belge_turu,
          durum: formData.durum,
          kdv_tutar: formData.kdv_tutar,
          genel_toplam: formData.genel_toplam,
          firma_id: firmaId,
        },
        FaturaKalemleri: formData.kalemler.map(k => ({
          birim: k.birim,
          miktar: k.miktar,
          kdv_orani: k.kdv_orani,
          birim_fiyat: k.birim_fiyat,
          kdv_tutar: k.kdv_tutar,
          genel_toplam: k.genel_toplam,
          aciklama: k.aciklama,
          firma_id: firmaId,
        })),
      };

      const { data } = await axios.post(
        "http://localhost:5127/api/faturalar/add",
        payload
      );
      onAddSuccess?.(data);

      // reset
      setFormData({
        fatura_no: "",
        cari_id: formData.cari_id, // keep auto-filled
        tarih: "",
        odeme_tipi: "",
        kdv_tutar: "",
        doviz_tipi: "",
        belge_turu: "",
        durum: "",
        genel_toplam: "",
        kalemler: [
          {
            birim: "",
            miktar: "",
            kdv_orani: "",
            birim_fiyat: "",
            kdv_tutar: "",
            genel_toplam: "",
            aciklama: "",
          },
        ],
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError("Fatura eklenirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-lg w-2/3 max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Fatura Ekle</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>

          {/* Genel Fatura Bilgileri: 3 sütunlu grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Fatura No", name: "fatura_no", type: "text" },
              { label: "Tarih", name: "tarih", type: "date" },
              { label: "Borç/Alacak", name: "odeme_tipi", type: "select", options: ["B","A"] },
              { label: "KDV Tutar", name: "kdv_tutar", type: "number" },
              { label: "Döviz Tipi", name: "doviz_tipi", type: "text" },
              { label: "Fatura/İrsaliye", name: "belge_turu", type: "text" },
              { label: "Muhasebe Kodu", name: "durum", type: "text" },
              { label: "Genel Toplam", name: "genel_toplam", type: "number" },
            ].map(fld => (
              <div key={fld.name}>
                <label className="block text-gray-700 mb-1">{fld.label}</label>
                {fld.type === "select" ? (
                  <select
                    name={fld.name}
                    value={formData[fld.name]}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded"
                    required
                  >
                    <option value="">Seçiniz</option>
                    {fld.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={fld.type}
                    name={fld.name}
                    value={formData[fld.name]}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                )}
              </div>
            ))}

            {/* Hidden cari_id */}
            <input type="hidden" name="cari_id" value={formData.cari_id} />
          </div>

          <hr className="mb-6" />

          {/* Fatura Kalemleri: 3 sütunlu grid */}
          <h3 className="text-lg font-bold mb-2">Fatura Kalemleri</h3>
          {formData.kalemler.map((kalem, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: "Birim", name: "birim", type: "text" },
                { label: "Miktar", name: "miktar", type: "number" },
                { label: "KDV Oranı", name: "kdv_orani", type: "number" },
                { label: "Birim Fiyat", name: "birim_fiyat", type: "number" },
                { label: "KDV Tutar", name: "kdv_tutar", type: "number" },
                { label: "Genel Toplam", name: "genel_toplam", type: "number" },
                { label: "Açıklama", name: "aciklama", type: "text", className: "col-span-2" },
              ].map(fld => (
                <div key={fld.name} className={fld.className || ""}>
                  <label className="block text-gray-700 mb-1">{fld.label}</label>
                  <input
                    type={fld.type}
                    name={fld.name}
                    value={kalem[fld.name]}
                    onChange={(e) => handleKalemChange(idx, e)}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => removeKalem(idx)}
                className="self-end bg-red-500 text-white px-3 py-2 rounded"
              >
                Sil
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addKalem}
            className="mb-6 bg-green-500 text-white px-4 py-2 rounded"
          >
            + Yeni Kalem Ekle
          </button>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Geri
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModal;
