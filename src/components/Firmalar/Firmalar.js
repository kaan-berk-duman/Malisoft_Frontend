import React, { useState, useEffect, useCallback } from "react";
import Header from "../Header";
import EditModal from "./EditModal";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import robotoFont from "../../assets/fonts/Roboto-Regular";
import axios from "axios";

const Tablo = () => {
  const [firmalar, setFirmalar] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [firmalarToEdit, setFirmalarToEdit] = useState(null);
  // Veri çekme fonksiyonu
  const fetchFirmalar = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5127/api/firmalar/list");
      setFirmalar(response.data);
    } catch (error) {
      console.error("API error:", error);
    }
  }, []);

  useEffect(() => {
    fetchFirmalar();
  }, [fetchFirmalar]);

  // Excel dışa aktar
  const exportToExcel = () => {
    const headers = [
      "ID",
      "Firma Kodu",
      "Firma Adı",
      "Yetkili Kişi",
      "Vergi Numarası",
      "Vergi Dairesi",
      "Adres",
      "Mail",
      "Kredi Limiti",
      "Açık Hesap?",
      "Dövizli Çalışma?",
      "Kart Durumu",
      "Kasa Kodu",
    ];

    const formattedData = firmalar.map(
      ({
        firma_id,
        firma_kodu,
        firma_adi,
        yetkili_kisi,
        vergi_numarasi,
        vergi_dairesi,
        adres,
        mail,
        kredi_limiti,
        acik_hesap_var_mi,
        dovizli_calisabilir_mi,
        kart_durumu,
        kasa_kodu,
      }) => ({
        "ID": firma_id,
        "Firma Kodu": firma_kodu,
        "Firma Adı": firma_adi,
        "Yetkili Kişi": yetkili_kisi,
        "Vergi Numarası": vergi_numarasi,
        "Vergi Dairesi": vergi_dairesi,
        "Adres": adres,
        "Mail": mail,
        "Kredi Limiti": kredi_limiti,
        "Açık Hesap?": acik_hesap_var_mi,
        "Dövizli Çalışma?": dovizli_calisabilir_mi,
        "Kart Durumu": kart_durumu,
        "Kasa Kodu": kasa_kodu,
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(formattedData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Firmalar");
    XLSX.writeFile(workbook, "Firmalar.xlsx");
  };

  // PDF dışa aktar
  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.addFileToVFS("Roboto-Regular.ttf", robotoFont);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    doc.text("Firmalar", 14, 10);
    doc.autoTable({
      head: [[
        "ID",
        "Firma Kodu",
        "Firma Adı",
        "Yetkili Kişi",
        "Vergi Numarası",
        "Vergi Dairesi",
        "Adres",
        "Mail",
        "Kredi Limiti",
        "Açık Hesap?",
        "Dövizli Çalışma?",
        "Kart Durumu",
        "Kasa Kodu",
      ]],
      body: firmalar.map(
        ({
          firma_id,
          firma_kodu,
          firma_adi,
          yetkili_kisi,
          vergi_numarasi,
          vergi_dairesi,
          adres,
          mail,
          kredi_limiti,
          acik_hesap_var_mi,
          dovizli_calisabilir_mi,
          kart_durumu,
        }) => [
            firma_id,
            firma_kodu,
            firma_adi,
            yetkili_kisi,
            vergi_numarasi,
            vergi_dairesi,
            adres,
            mail,
            kredi_limiti,
            acik_hesap_var_mi,
            dovizli_calisabilir_mi,
            kart_durumu,
          ]
      ),
      styles: { font: "Roboto" },
    });

    doc.save("Firmalar.pdf");
  };

  const filteredFirmalar = searchTerm
    ? firmalar.filter((firma) => {
      return (
        (firma.firma_kodu && firma.firma_kodu.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (firma.firma_adi && firma.firma_adi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (firma.yetkili_kisi && firma.yetkili_kisi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (firma.vergi_numarasi && firma.vergi_numarasi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (firma.vergi_dairesi && firma.vergi_dairesi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (firma.adres && firma.adres.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (firma.mail && firma.mail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (firma.kasa_kodu && firma.kasa_kodu.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (firma.sehir && firma.sehir.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (firma.ilce && firma.ilce.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (firma.telefon && firma.telefon.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (firma.kart_durumu && firma.kart_durumu.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    })
    : firmalar;

  const totalPages = Math.ceil(filteredFirmalar.length / recordsPerPage);
  const currentDepolar = filteredFirmalar.slice(
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

  const handleEdit = (firma_id) => {
    const firmaToEdit = firmalar.find((f) => f.firma_id === firma_id);
    setFirmalarToEdit(firmaToEdit);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    window.alert("Firma başarıyla güncellendi. Cariyi de kontrol ediniz.");
    fetchFirmalar();
    setEditModalOpen(false);
  };

  return (
    <>
      <div className="flex-1 flex flex-col bg-gray-100 ml-64 min-h-screen">
        <Header />
        <div className="p-6 flex flex-col justify-center items-center">
          <div className="bg-white shadow-lg rounded-lg w-full max-w-6xl">
            <div className="bg-blue-500 text-white flex justify-between items-center py-4 px-6 rounded-t-lg">
              <h1 className="text-xl font-bold whitespace-nowrap" style={{ pointerEvents: "none" }}>
                Firmalar
              </h1>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border rounded px-2 py-1 text-black whitespace-nowrap"
                />
              </div>
            </div>

            {/* Kaydırılabilir kapsayıcı */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border-collapse printable-area">
                <thead>
                  <tr>
                    {["ID", "Firma Kodu", "Firma Adı", "Yetkili Kişi", "Vergi Numarası", "Vergi Dairesi", "Adres", "Şehir", "İlçe", "Telefon", "Mail", "Kredi Limiti", "Açık Hesap?", "Dövizli Çalışma?", "Kart Durumu", "Kasa Kodu", ""].map((head) => (
                      <th
                        key={head}
                        className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold whitespace-nowrap"
                        style={{ pointerEvents: "none" }}
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentDepolar.length > 0 ? (
                    currentDepolar.map((firma) => (
                      <tr key={firma.firma_id} className="hover:bg-gray-100">
                        {[
                          firma.firma_id,
                          firma.firma_kodu,
                          firma.firma_adi,
                          firma.yetkili_kisi,
                          firma.vergi_numarasi,
                          firma.vergi_dairesi,
                          firma.adres,
                          firma.sehir,
                          firma.ilce,
                          firma.telefon,
                          firma.mail,
                          firma.kredi_limiti,
                          firma.acik_hesap_var_mi,
                          firma.dovizli_calisabilir_mi,
                          firma.kart_durumu,
                          firma.kasa_kodu
                        ].map((cell, idx) => (
                          <td
                            key={idx}
                            className="py-2 px-4 border-b border-gray-200 whitespace-nowrap"
                          >
                            {cell}
                          </td>
                        ))}
                        <td className="py-2 px-4 border-b border-gray-200 whitespace-nowrap">
                          <button
                            onClick={() => handleEdit(firma.firma_id)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M16 3l5 5m-5-5L8.5 15.5m0 0L7 19l3.5-1.5" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="17" className="text-center py-4 text-gray-500 whitespace-nowrap" style={{ pointerEvents: "none" }}>
                        Firma bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* /Kaydırılabilir kapsayıcı */}

            <div className="flex justify-between items-center p-4 border-t">
              <div className="flex items-center gap-3">
                <label htmlFor="recordsPerPage" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Sayfa başına gösterilecek satır sayısı:
                </label>
                <select
                  id="recordsPerPage"
                  value={recordsPerPage}
                  onChange={handleRecordsPerPageChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out shadow-sm whitespace-nowrap"
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
                  className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 whitespace-nowrap"
                >
                  Excel'e Aktar
                </button>
                <button
                  onClick={exportToPDF}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 whitespace-nowrap"
                >
                  PDF'ye Aktar
                </button>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap" style={{ pointerEvents: "none" }}>
                  {currentPage * recordsPerPage - recordsPerPage + 1}-
                  {Math.min(currentPage * recordsPerPage, filteredFirmalar.length)} of {filteredFirmalar.length}
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
      <EditModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} firma={firmalarToEdit} onSave={handleEditSuccess} />
    </>
  );
};

export default Tablo;
