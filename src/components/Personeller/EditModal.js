import React, { useState, useEffect,useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const EditModal = ({ isOpen, onClose, onSave, personel }) => {
    const { user } = useContext(AuthContext);            // ← buradan alıyoruz
    const firmaId = user?.firma_id;
  const [editedPersonel, setEditedPersonel] = useState(personel || {});

  useEffect(() => {
    if (isOpen && personel) {
      setEditedPersonel(personel);
    }
  }, [isOpen, personel]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedPersonel((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Burada payload'u açıkça oluşturup id'yi de ekliyoruz
    const payload = {
      personel_id: editedPersonel.personel_id,
      personel_ad_soyad: editedPersonel.personel_ad_soyad,
      personel_meslek: editedPersonel.personel_meslek,
      personel_maas: editedPersonel.personel_maas,
      personel_telefon: editedPersonel.personel_telefon,
      personel_mail: editedPersonel.personel_mail,
      personel_giris_tarihi: editedPersonel.personel_giris_tarihi,
        firma_id: firmaId, 
    };

    try {
      const response = await fetch(
        "http://localhost:5127/api/personeller/update",
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
        <h2 className="text-xl font-bold mb-4">Personel Düzenle</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* gizli id alanı */}
          <input type="hidden" name="personel_id" value={editedPersonel.personel_id} />

          {/* Ad Soyad */}
          <div className="mb-4">
            <label className="block text-gray-700">Ad Soyad</label>
            <input
              type="text"
              name="personel_ad_soyad"
              value={editedPersonel.personel_ad_soyad || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          {/* Meslek */}
          <div className="mb-4">
            <label className="block text-gray-700">Meslek</label>
            <input
              type="text"
              name="personel_meslek"
              value={editedPersonel.personel_meslek || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          {/* Maaş */}
          <div className="mb-4">
            <label className="block text-gray-700">Maaş</label>
            <input
              type="text"
              name="personel_maas"
              value={editedPersonel.personel_maas || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          {/* Telefon */}
          <div className="mb-4">
            <label className="block text-gray-700">Telefon</label>
            <input
              type="text"
              name="personel_telefon"
              value={editedPersonel.personel_telefon || ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          {/* Mail */}
          <div className="mb-4">
            <label className="block text-gray-700">Mail</label>
            <input
              type="email"
              name="personel_mail"
              value={editedPersonel.personel_mail || ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          {/* Giriş Tarihi */}
          <div className="mb-4">
            <label className="block text-gray-700">Giriş Tarihi</label>
            <input
              type="date"
              name="personel_giris_tarihi"
              value={
                editedPersonel.personel_giris_tarihi
                  ? editedPersonel.personel_giris_tarihi.substring(0, 10)
                  : ""
              }
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
