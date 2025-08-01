import React, { useState, useEffect } from "react";

const EditModal = ({ isOpen, onClose, onSave, cari }) => {
  const [editedcari, setEditedcari] = useState(cari || {});

  useEffect(() => {
    if (isOpen && cari) {
      setEditedcari(cari);
    }
  }, [isOpen, cari]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedcari((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Burada payload'u açıkça oluşturup id'yi de ekliyoruz
    const payload = {
      cari_kod: editedcari.cari_kod,
      unvan: editedcari.unvan,
      yetkili_ad_soyad: editedcari.yetkili_ad_soyad,
      adres: editedcari.adres,
      telefon: editedcari.telefon,
      mail: editedcari.mail,
      vergi_dairesi: editedcari.vergi_dairesi,
      vergi_no: editedcari.vergi_no,
      tc_kimlik_no: editedcari.tc_kimlik_no,
      banka_bilgileri: editedcari.banka_bilgileri,
      doviz_tipi: editedcari.doviz_tipi,
      bakiye: editedcari.bakiye,
      tarih: editedcari.tarih,
    };

    try {
      const response = await fetch(
        "http://localhost:5127/api/cariler/update",
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
      alert("Cari güncellenemedi: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
        <h2 className="text-xl font-bold mb-4">Cari Düzenle</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* gizli id alanı */}
          <input type="hidden" name="depo_kodu" value={editedcari.cari_kod} />

          <div className="mb-4">
            <label className="block text-gray-700">Unvan</label>
            <input
              type="text"
              name="unvan"
              value={editedcari.unvan || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Yetkili Kişi</label>
            <input
              type="text"
              name="yetkili_ad_soyad"
              value={editedcari.yetkili_ad_soyad || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Telefon</label>
            <input
              type="text"
              name="telefon"
              value={editedcari.telefon || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Mail</label>
            <input
              type="email"
              name="mail"
              value={editedcari.mail || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Adres</label>
            <input
              type="text"
              name="adres"
              value={editedcari.adres || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Vergi Dairesi</label>
            <input
              type="text"
              name="vergi_dairesi"
              value={editedcari.vergi_dairesi || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Vergi Numarası</label>
            <input
              type="text"
              name="vergi_no"
              value={editedcari.vergi_no || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">TC Kimlik Numarası</label>
            <input
              type="text"
              name="tc_kimlik_no"
              value={editedcari.tc_kimlik_no || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Banka Bilgileri</label>
            <input
              type="text"
              name="banka_bilgileri"
              value={editedcari.banka_bilgileri || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Döviz Tipi</label>
            <input
              type="number"
              name="doviz_tipi"
              value={editedcari.doviz_tipi || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Bakiye</label>
            <input
              type="number"
              name="bakiye"
              value={editedcari.bakiye || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Tarih</label>
            <input
              type="text"
              name="tarih"
              value={editedcari.tarih || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
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
