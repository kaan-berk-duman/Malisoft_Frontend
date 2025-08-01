import React, { useState, useEffect } from "react";

const EditModal = ({ isOpen, onClose, onSave, firma }) => {
  const [editedfirma, setEditedfirma] = useState(firma || {});

  useEffect(() => {
    if (isOpen && firma) {
      setEditedfirma(firma);
    }
  }, [isOpen, firma]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedfirma((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Burada payload'u açıkça oluşturup id'yi de ekliyoruz
    const payload = {
      Firma_kodu: editedfirma.firma_kodu,
      Firma_adi: editedfirma.firma_adi,
      Yetkili_kisi: editedfirma.yetkili_kisi,
      Vergi_numarasi: editedfirma.vergi_numarasi,
      Vergi_dairesi: editedfirma.vergi_dairesi,
      Adres: editedfirma.adres,
      Telefon: editedfirma.telefon,
      Mail: editedfirma.mail,
      Sehir: editedfirma.sehir,
      Ilce: editedfirma.ilce,
      Kart_durumu: editedfirma.kart_durumu,
      Kredi_limiti: editedfirma.kredi_limiti,
      Acik_hesap_var_mi: editedfirma.acik_hesap_var_mi,
      Dovizli_calisabilir_mi: editedfirma.dovizli_calisabilir_mi,
      Kasa_kodu: editedfirma.kasa_kodu,
    };

    try {
      const response = await fetch(
        "http://localhost:5127/api/firmalar/update",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      // Başarılıysa üst componente bildirip modalı kapat
      onSave(payload);
      onClose();
    } catch (err) {
      console.error("Güncelleme hatası:", err);
      alert("Firma güncellenemedi: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
        <h2 className="text-xl font-bold mb-4">Firma Düzenle</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* gizli id alanı */}
          <input type="hidden" name="depo_kodu" value={editedfirma.depo_kodu} />

          {/* Meslek */}
          <div className="mb-4">
            <label className="block text-gray-700">Şehir</label>
            <input
              type="text"
              name="sehir"
              value={editedfirma.sehir || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">İlçe</label>
            <input
              type="text"
              name="ilce"
              value={editedfirma.ilce || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Kredi Limiti</label>
            <input
              type="number"
              name="kredi_limiti"
              value={editedfirma.kredi_limiti || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Açık Hesap?</label>
            <input
              type="text"
              name="acik_hesap_var_mi"
              value={editedfirma.acik_hesap_var_mi || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Dövizli Çalışma?</label>
            <input
              type="text"
              name="dovizli_calisabilir_mi"
              value={editedfirma.dovizli_calisabilir_mi || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Kart Durumu</label>
            <select
              name="kart_durumu"
              value={editedfirma.kart_durumu || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            >
              <option value="A">A</option>
              <option value="P">P</option>
            </select>
          </div>

          {/* Butonlar */}
          <div className="col-span-2 flex justify-end gap-4 mt-4">
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
              Düzenle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
