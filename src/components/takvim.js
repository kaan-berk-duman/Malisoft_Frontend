import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import { AuthContext } from "../context/AuthContext";

const Takvim = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [notes, setNotes] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteTime, setNewNoteTime] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [alertMessage, setAlertMessage] = useState("");

  // 1) Notları sunucudan çekip gruplandıran fonksiyon
  const fetchNotes = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5127/api/kullanici_notlari/list"
      );
      const myNotes = res.data.filter(
        (n) => n.kullanici_id === user.kullanici_id
      );
      const grouped = {};
      myNotes.forEach((n) => {
        const d = new Date(n.not_tarih);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(n);
      });
      setNotes(grouped);
    } catch (err) {
      console.error("Notlar yüklenirken hata:", err);
      setAlertMessage("Notlar yüklenirken hata oluştu.");
    }
  };

  // İlk yüklemede (ve user değiştiğinde) notları çek
  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    fetchNotes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const today = new Date();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const lastDayOfMonth = new Date(currentYear, currentMonth, daysInMonth).getDay();

  const handleDateClick = (day) => {
    const sel = new Date(currentYear, currentMonth, day);
    if (sel < new Date(today.setHours(0, 0, 0, 0))) {
      setAlertMessage("Geçmiş günlere not eklenemez.");
      return;
    }
    setAlertMessage("");
    setSelectedDate(day);
  };

  const handleSaveNote = async () => {
    if (!newNoteText || !newNoteTime || selectedDate === null) return;

    // UTC olarak oluştur, böylece timezone kayması olmaz
    const dateObj = new Date(Date.UTC(currentYear, currentMonth, selectedDate));
    const isoDate = dateObj.toISOString(); // "2025-04-17T00:00:00.000Z"

    const payload = {
      Kullanici_id: user.kullanici_id,
      Not_icerik: newNoteText,
      Not_tarih: isoDate,
      Not_saat: newNoteTime,
    };

    try {
      await axios.post(
        "http://localhost:5127/api/kullanici_notlari/add",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      // not eklendikten sonra tekrar çek
      await fetchNotes();
      // formu sıfırla, modalı kapat
      setNewNoteText("");
      setNewNoteTime("");
      setSelectedDate(null);
      setAlertMessage("");
    } catch (err) {
      console.error("Not kaydedilirken hata:", err.response?.data || err);
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data ||
        "Not kaydedilirken hata oluştu.";
      setAlertMessage(serverMsg);
    }
  };

  const handleDeleteNote = async (not_id) => {
    try {
      console.log(not_id);
      const response = await axios.delete(
        "http://localhost:5127/api/kullanici_notlari/delete",
        {
          params: { notId: not_id },            // artık gövdede gönderiyoruz
        }
      );
      if (response.status === 200) {
        await fetchNotes();               // silme sonrası yenile
        setAlertMessage("");
      } else {
        console.error("Silme işlemi başarısız oldu:", response.data);
        setAlertMessage("Not silme işlemi başarısız oldu.");
      }
    } catch (err) {
      console.error("Not silinirken hata:", err.response?.data || err);
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data ||
        "Not silinirken hata oluştu.";
      setAlertMessage(serverMsg);
    }
  };

  const handleMonthChange = (dir) => {
    if (dir === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((y) => y - 1);
      } else setCurrentMonth((m) => m - 1);
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((y) => y + 1);
      } else setCurrentMonth((m) => m + 1);
    }
  };

  const generateDays = () => {
    const arr = [];
    const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    for (let i = 0; i < offset; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    for (let i = lastDayOfMonth; i < 6; i++) arr.push(null);
    return arr;
  };

  if (!user) return null;

  const dateKey =
    selectedDate !== null
      ? `${currentYear}-${currentMonth}-${selectedDate}`
      : "";

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen ml-64">
      <Header />

      <div className="container mx-auto p-4">
        {/* Ay/Yıl Kontrol */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg mb-2">
          <button
            onClick={() => handleMonthChange("prev")}
            className="px-4 py-2 bg-blue-700 rounded-md hover:bg-blue-800"
          >
            Önceki Ay
          </button>
          <div className="text-2xl font-semibold select-none">
            {new Date(currentYear, currentMonth).toLocaleString("default", {
              month: "long",
            })}{" "}
            {currentYear}
          </div>
          <button
            onClick={() => handleMonthChange("next")}
            className="px-4 py-2 bg-blue-700 rounded-md hover:bg-blue-800"
          >
            Sonraki Ay
          </button>
        </div>

        {/* Takvim */}
        <div className="grid grid-cols-7 gap-2">
          {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d) => (
            <div
              key={d}
              className="text-center font-bold text-gray-700 uppercase py-2"
            >
              {d}
            </div>
          ))}

          {generateDays().map((day, idx) =>
            day ? (
              <button
                key={idx}
                onClick={() => handleDateClick(day)}
                className={`h-24 border rounded-lg flex flex-col items-center justify-center
                  ${
                    notes[`${currentYear}-${currentMonth}-${day}`]?.length
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-800"
                  } hover:bg-blue-200 transition-all duration-200 shadow-md`}
              >
                <div className="text-lg font-semibold">{day}</div>
                {notes[`${currentYear}-${currentMonth}-${day}`]?.map(
                  (note) => (
                    <div
                      key={note.not_id}
                      className="text-xs truncate w-full text-center mt-1"
                    >
                      {note.not_saat} : {note.not_icerik}
                    </div>
                  )
                )}
              </button>
            ) : (
              <div key={idx} className="h-24" />
            )
          )}
        </div>

        {alertMessage && (
          <div className="mt-4 text-red-600 text-sm text-center">
            {alertMessage}
          </div>
        )}
      </div>

      {/* Not Ekle / Listele Modalı */}
      {selectedDate !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">
              {selectedDate}. Gün Notları
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {notes[dateKey]?.map((note) => (
                <div
                  key={note.not_id}
                  className="flex items-center justify-between border p-2 rounded-md"
                >
                  <span className="text-sm">
                    {note.not_saat} : {note.not_icerik}
                  </span>
                  <button
                    onClick={() => handleDeleteNote(note.not_id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <input
                type="text"
                placeholder="Not Girin"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="w-full p-2 border rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="time"
                value={newNoteTime}
                onChange={(e) => setNewNoteTime(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setSelectedDate(null)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                İptal
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Takvim;
