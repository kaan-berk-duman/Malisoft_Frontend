import React, { useState, useEffect, useCallback } from "react";
import Header from "../Header";
import AddModal from "./AddModal";
import EditModal from "./EditModal";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import robotoFont from "../../assets/fonts/Roboto-Regular";
import axios from "axios";

const Tablo = () => {
  const [cariler, setCariler] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [carilerToEdit, setCarilerToEdit] = useState(null);

  const fetchCariler = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5127/api/cariler/list");
      setCariler(response.data);
    } catch (error) {
      console.error("API error:", error);
    }
  }, []);

  useEffect(() => {
    fetchCariler();
  }, [fetchCariler]);

  const exportToExcel = () => {
    const headers = [
      "ID",
      "Cari Kodu",
      "Unvan",
      "Yetkili Kişi",
      "Telefon",
      "Mail",
      "Adres",
      "Vergi Dairesi",
      "Vergi Numarası",
      "TC Kimlik Numarası",
      "Banka Bilgileri",
      "Döviz Tipi",
      "Bakiye",
      "Tarih",
    ];

    const formattedData = cariler.map(
      ({
        cari_id,
        cari_kod,
        unvan,
        yetkili_ad_soyad,
        telefon,
        mail,
        adres,
        vergi_dairesi,
        vergi_no,
        tc_kimlik_no,
        banka_bilgileri,
        doviz_tipi,
        bakiye,
        tarih,
      }) => ({
        "ID": cari_id,
        "Cari Kodu": cari_kod,
        "Unvan": unvan,
        "Yetkili Kişi": yetkili_ad_soyad,
        "Telefon": telefon,
        "Mail": mail,
        "Adres": adres,
        "Vergi Dairesi": vergi_dairesi,
        "Vergi Numarası": vergi_no,
        "TC Kimlik Numarası": tc_kimlik_no,
        "Banka Bilgileri": banka_bilgileri,
        "Döviz Tipi": doviz_tipi,
        "Bakiye": bakiye,
        "Tarih": formatDate(tarih),
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(formattedData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cariler");
    XLSX.writeFile(workbook, "Cariler.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.addFileToVFS("Roboto-Regular.ttf", robotoFont);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    doc.text("Cariler", 14, 10);
    doc.autoTable({
      head: [
        [
          "ID",
          "Cari Kodu",
          "Unvan",
          "Yetkili Kişi",
          "Telefon",
          "Mail",
          "Adres",
          "Vergi Dairesi",
          "Vergi Numarası",
          "TC Kimlik Numarası",
          "Banka Bilgileri",
          "Döviz Tipi",
          "Bakiye",
          "Tarih",
        ]
      ],
      body: cariler.map(
        ({
          cari_id,
          cari_kod,
          unvan,
          yetkili_ad_soyad,
          telefon,
          mail,
          adres,
          vergi_dairesi,
          vergi_no,
          tc_kimlik_no,
          banka_bilgileri,
          doviz_tipi,
          bakiye,
          tarih,
        }) => [
          cari_id,
          cari_kod,
          unvan,
          yetkili_ad_soyad,
          telefon,
          mail,
          adres,
          vergi_dairesi,
          vergi_no,
          tc_kimlik_no,
          banka_bilgileri,
          doviz_tipi,
          bakiye,
          formatDate(tarih),
          ]
      ),
      styles: { font: "Roboto" },
    });

    doc.save("Cariler.pdf");
  };

  const filteredCariler = searchTerm
    ? cariler.filter((cari) => {
      return (
        (cari.cari_kod && cari.cari_kod.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cari.unvan && cari.unvan.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cari.yetkili_ad_soyad && cari.yetkili_ad_soyad.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cari.telefon && cari.telefon.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cari.mail && cari.mail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cari.adres && cari.adres.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cari.vergi_dairesi && cari.vergi_dairesi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cari.vergi_no && cari.vergi_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cari.tc_kimlik_no && cari.tc_kimlik_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cari.banka_bilgileri && cari.banka_bilgileri.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    })
    : cariler;

  const totalPages = Math.ceil(filteredCariler.length / recordsPerPage);
  const currentDepolar = filteredCariler.slice(
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

  const handleEdit = (cari_id) => {
    const cariToEdit = cariler.find((cari) => cari.cari_id === cari_id);
    setCarilerToEdit(cariToEdit);
    setEditModalOpen(true);
  };

  const handleAddNew = () => {
    setAddModalOpen(true);
  };

  const handleAddSuccess = () => {
    window.alert("Cari başarıyla eklendi. Firmaları kontrol edin.");
    fetchCariler();
    setAddModalOpen(false);
  };

  const handleEditSuccess = () => {
    window.alert("Cari başarıyla güncellendi.Firmaları kontrol edin.");
    fetchCariler();
    setEditModalOpen(false);
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
                Cariler
              </h1>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border rounded px-2 py-1 text-black"
                />
                <button
                  onClick={handleAddNew}
                  className="bg-blue-600 text-white hover:bg-blue-700 rounded-full p-2 flex items-center justify-center"
                  title="Add New"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border-collapse printable-area">
                <thead>
                  <tr>
                    {[
                      'ID', 'Cari Kodu', 'Unvan', 'Yetkili Kişi', 'Telefon', 'Mail', 'Adres', 'Vergi Dairesi', 'Vergi Numarası', 'TC Kimlik No', 'Banka Bilgileri', 'Döviz Tipi', 'Bakiye', 'Tarih'
                    ].map((col) => (
                      <th
                        key={col}
                        className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold whitespace-nowrap"
                        style={{ pointerEvents: 'none' }}
                      >
                        {col}
                      </th>
                    ))}
                    <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentDepolar.length > 0 ? (
                    currentDepolar.map((cari) => (
                      <tr key={cari.cari_id} className="hover:bg-gray-100">
                        {[
                          cari.cari_id,
                          cari.cari_kod,
                          cari.unvan,
                          cari.yetkili_ad_soyad,
                          cari.telefon,
                          cari.mail,
                          cari.adres,
                          cari.vergi_dairesi,
                          cari.vergi_no,
                          cari.tc_kimlik_no,
                          cari.banka_bilgileri,
                          cari.doviz_tipi,
                          cari.bakiye,
                          formatDate(cari.tarih),
                        ].map((cell, idx) => (
                          <td key={idx} className="py-2 px-4 border-b border-gray-200 whitespace-nowrap" style={{ pointerEvents: 'none' }}>
                            {cell}
                          </td>
                        ))}
                        <td className="py-2 px-4 border-b border-gray-200">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              onClick={() => handleEdit(cari.cari_id)}
                              className="text-blue-500 hover:text-blue-700"
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M16 3l5 5m-5-5L8.5 15.5m0 0L7 19l3.5-1.5" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={15} className="text-center py-4 text-gray-500 whitespace-nowrap" style={{ pointerEvents: 'none' }}>
                        Cari bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
                  {Math.min(currentPage * recordsPerPage, filteredCariler.length)} of {filteredCariler.length}
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

      <AddModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onAddSuccess={handleAddSuccess} />
      <EditModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} cari={carilerToEdit} onSave={handleEditSuccess} />
    </>
  );
};

export default Tablo;
