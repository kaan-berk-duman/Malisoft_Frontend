import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Axios import edildi
import Header from "../Header";
import { AuthContext } from "../../context/AuthContext";

const ProfilSayfasi = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true); // Notlar yükleniyor durumu

  // Eğer user yoksa login sayfasına gönder
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Kullanıcının notlarını çek
  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) return; // user henüz yoksa boş geç

      try {
        const response = await axios.get("http://localhost:5127/api/Kullanici_notlari/list");
        // API'dan gelen veriden sadece aktif kullanıcıya ait notları filtrele
        const userNotes = response.data.filter(
          (note) => note.kullanici_id === user.kullanici_id
        );
        setNotes(userNotes);
      } catch (error) {
        console.error("Notlar alınırken bir hata oluştu:", error);
      } finally {
        setLoadingNotes(false);
      }
    };

    fetchNotes();
  }, [user]);

  // Eğer user veya notlar henüz yüklenmediyse
  if (!user || loadingNotes) {
    return (
      <div className="flex items-center justify-center h-screen">
        Yükleniyor...
      </div>
    );
  }

  const formatDate = dateStr =>
    dateStr ? new Date(dateStr).toLocaleDateString('tr-TR') : "";

  return (
    <>
      <div className="flex-1 flex flex-col bg-gray-100 ml-64 h-screen">
        <Header />
        <div className="flex justify-center items-start h-full py-6 px-12">
          {/* Sol Kısım: Profil Resmi ve Bilgiler */}
          <div className="w-1/4 bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-3xl font-semibold mt-4 text-gray-900" style={{ pointerEvents: "none" }}>
              {user.kullanici_ad_soyad}
            </h2>
            <p className="text-xl text-gray-600 mt-2" style={{ pointerEvents: "none" }}>
              {user.kullanici_gorev}
            </p>
            <div className="mt-6 text-left space-y-2" style={{ pointerEvents: "none" }}>
              <p className="font-medium text-gray-700">
                Email: <span className="text-gray-500">{user.kullanici_mail}</span>
              </p>
              <p className="font-medium text-gray-700">
                Telefon: <span className="text-gray-500">{user.kullanici_telefon}</span>
              </p>
              <p className="font-medium text-gray-700">
                Kullanıcı ID: <span className="text-gray-500">{user.kullanici_id}</span>
              </p>
            </div>
          </div>

          {/* Sağ Kısım: Notlar ve Etkinlikler */}
          <div className="flex-1 ml-12 bg-white rounded-lg shadow-lg p-6" style={{ pointerEvents: "none" }}>
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              Notlar ve Etkinlikler
            </h3>
            {notes.length > 0 ? (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div
                    key={note.not_id}
                    className="p-4 border-l-4 border-blue-500 bg-gray-50 shadow-sm rounded-lg"
                  >
                    <p className="text-lg text-gray-800">{note.not_icerik}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Tarih: {formatDate(note.not_tarih)} {note.not_saat}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">Henüz not eklenmemiş.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilSayfasi;
