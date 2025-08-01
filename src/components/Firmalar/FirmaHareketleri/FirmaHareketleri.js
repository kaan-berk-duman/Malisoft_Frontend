import React, { useState, useEffect, useCallback, useContext } from "react";
import Header from "../../Header";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import robotoFont from "../../../assets/fonts/Roboto-Regular";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";

const Tablo = () => {
  const { user } = useContext(AuthContext);
      const userFirmaId = user?.firma_id;
  const [hareketler, sethareketler] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  // 1) Veri çekme fonksiyonu
  const fetchhareketler = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5127/api/firmahareketleri/list");
      const filtered = response.data.filter(item => item.firma_id === userFirmaId);
      sethareketler(filtered);
    } catch (error) {
      console.error("API error:", error);
    }
  }, [userFirmaId]);

  // 2) İlk yüklemede ve fetchPersoneller değiştiğinde çağır
  useEffect(() => {
    fetchhareketler();
  }, [fetchhareketler]);


  // Excel ve PDF dışa aktarma fonksiyonları (aynı kalabilir)
  const exportToExcel = () => {
    const headers = [
      "ID",
      "İşlem Tipi",
      "Borç/Alacak",
      "Tutar",
      "Tarih",
      "Muhasebe Kodu",
      "Döviz Kodu",
      "Döviz Kuru",
    ];

    const formattedData = hareketler.map(
      ({
        firma_hareket_id,
        islem_tipi,
        borc_alacak,
        tutar,
        tarih,
        aciklama,
        doviz_kodu,
        doviz_kuru,
      }) => ({
        "ID": firma_hareket_id,
        "İşlem Tipi": islem_tipi,
        "Borç/Alacak": borc_alacak,
        "Tutar": tutar,
        "Tarih": formatDate(tarih),
        "Muhasebe Kodu": aciklama,
        "Döviz Kodu": doviz_kodu,
        "Döviz Kuru": doviz_kuru,
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(formattedData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FirmaHareketleri");
    XLSX.writeFile(workbook, "FirmaHareketleri.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.addFileToVFS("Roboto-Regular.ttf", robotoFont);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    doc.text("Firma Hareketleri", 14, 10);
    doc.autoTable({
      head: [
        [
          "ID",
          "İşlem Tipi",
          "Borç/Alacak",
          "Tutar",
          "Tarih",
          "Muhasebe Kodu",
          "Döviz Kodu",
          "Döviz Kuru",
        ],
      ],
      body: hareketler.map(
        ({
          firma_hareket_id,
          islem_tipi,
          borc_alacak,
          tutar,
          tarih,
          aciklama,
          doviz_kodu,
          doviz_kuru,
        }) => [
            firma_hareket_id,
            islem_tipi,
            borc_alacak,
            tutar,
            formatDate(tarih),
            aciklama,
            doviz_kodu,
            doviz_kuru,
          ]
      ),
      styles: { font: "Roboto" },
    });

    doc.save("FirmaHareketleri.pdf");
  };

  const filteredhareketler = searchTerm
    ? hareketler.filter((hareket) => {
      return (
        (hareket.islem_tipi && hareket.islem_tipi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (hareket.borc_alacak && hareket.borc_alacak.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (hareket.aciklama && hareket.aciklama.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (hareket.doviz_kodu && hareket.doviz_kodu.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    })
    : hareketler;

  const totalPages = Math.ceil(filteredhareketler.length / recordsPerPage);
  const currentPersoneller = filteredhareketler.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleRecordsPerPageChange = (event) => {
    setRecordsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const formatDate = dateStr =>
    dateStr ? new Date(dateStr).toLocaleDateString('tr-TR') : "";

  return (
    <>
      <div className="flex-1 flex flex-col bg-gray-100 ml-64 min-h-screen">
        <Header />
        <div className="p-6 flex flex-col justify-center items-center">
          <div className="bg-white shadow-lg rounded-lg w-full max-w-6xl">
            <div className="bg-blue-500 text-white flex justify-between items-center py-4 px-6 rounded-t-lg">
              <h1 className="text-xl font-bold" style={{ pointerEvents: "none" }}>
                Firma Hareketleri
              </h1>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border rounded px-2 py-1 text-black"
                />
              </div>
            </div>
            <table className="min-w-full bg-white border-collapse printable-area">
              <thead>
                <tr>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>ID</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>İşlem Tipi</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Borç/Alacak</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Tutar</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Tarih</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Muhasebe Kodu</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Döviz Kodu</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Döviz Kuru</th>
                </tr>
              </thead>
              <tbody>
                {currentPersoneller.length > 0 ? (
                  currentPersoneller.map((hareket) => (
                    <tr key={hareket.firma_hareket_id} className="hover:bg-gray-100">
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{hareket.firma_hareket_id}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{hareket.islem_tipi}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{hareket.borc_alacak}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{hareket.tutar}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{formatDate(hareket.tarih)}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{hareket.aciklama}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{hareket.doviz_kodu}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{hareket.doviz_kuru}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-gray-500" style={{ pointerEvents: "none" }}>
                      Firma hareketleri bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-between items-center p-4 border-t">
              <div className="flex items-center gap-3">
                <label htmlFor="recordsPerPage" className="text-sm font-medium text-gray-700">
                  Sayfa başına gösterilecek satır sayısı:
                </label>
                <select
                  id="recordsPerPage"
                  value={recordsPerPage}
                  onChange={handleRecordsPerPageChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out shadow-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={exportToExcel}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600"
                >
                  Excel'e Aktar
                </button>
                <button
                  onClick={exportToPDF}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600"
                >
                  PDF'ye Aktar
                </button>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700" style={{ pointerEvents: "none" }}>
                  {currentPage * recordsPerPage - recordsPerPage + 1}-
                  {Math.min(currentPage * recordsPerPage, filteredhareketler.length)} of {filteredhareketler.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={`h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium shadow-sm transition-colors ${currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                  >
                    {"<<"}
                  </button>
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className={`h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium shadow-sm transition-colors ${currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                  >
                    {"<"}
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium shadow-sm transition-colors ${currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                  >
                    {">"}
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium shadow-sm transition-colors ${currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                  >
                    {">>"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tablo;
