import React, { useState, useEffect } from "react";

const EditModal = ({ isOpen, onClose, onSave, kullanici }) => {
  // Başlangıçta personel objesini state'e aktar
  const [editedkullanici, setEditedkullanici] = useState(kullanici || {});

  useEffect(() => {
    if (isOpen && kullanici) {
      setEditedkullanici(kullanici);
    }
  }, [isOpen, kullanici]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedkullanici((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Burada payload'u açıkça oluşturup id'yi de ekliyoruz
    const payload = {
      Kullanici_id: editedkullanici.kullanici_id,
      Kullanici_ad_soyad: editedkullanici.kullanici_ad_soyad,
      Kullanici_telefon: editedkullanici.kullanici_telefon,
      Kullanici_mail: editedkullanici.kullanici_mail,
      Kullanici_sifre: editedkullanici.kullanici_sifre,
      Kullanici_gorev: editedkullanici.kullanici_gorev,
      Firma_id: editedkullanici.firma_id,
    };
    try {
      const response = await fetch(
        "http://localhost:5127/api/kullanicilar/update",
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
      alert("Personel güncellenemedi: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
        <h2 className="text-xl font-bold mb-4">Kullanıcı Düzenle</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* gizli id alanı */}
          <input type="hidden" name="kullanici_id" value={editedkullanici.kullanici_id} />

          {/* Ad Soyad */}
          <div className="mb-4">
            <label className="block text-gray-700">Ad Soyad</label>
            <input
              type="text"
              name="kullanici_ad_soyad"
              value={editedkullanici.kullanici_ad_soyad || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          {/* Meslek */}
          <div className="mb-4">
            <label className="block text-gray-700">Telefon</label>
            <input
              type="text"
              name="kullanici_telefon"
              value={editedkullanici.kullanici_telefon || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          {/* Maaş */}
          <div className="mb-4">
            <label className="block text-gray-700">Mail</label>
            <input
              type="email"
              name="kullanici_mail"
              value={editedkullanici.kullanici_mail || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          {/* Telefon */}
          <div className="mb-4">
            <label className="block text-gray-700">Şifre</label>
            <input
              type="text"
              name="kullanici_sifre"
              value={editedkullanici.kullanici_sifre || ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          {/* Mail */}
          <div className="mb-4">
            <label className="block text-gray-700">Görev</label>
            <input
              type="text"
              name="kullanici_gorev"
              value={editedkullanici.kullanici_gorev || ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Firma ID</label>
            <input
              type="number"
              name="firma_id"
              value={editedkullanici.firma_id}
              onChange={handleChange}
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
