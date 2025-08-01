import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../assets/Logo.png";
import { AuthContext } from "../context/AuthContext"; // ← Context'i import et

function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext); // ← setUser'ı al

  // State’ler
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Backend'den kullanıcı listesini çekiyoruz
      const response = await axios.get(
        "http://localhost:5127/api/Kullanicilar/list"
      );
      const users = response.data;

      // E-posta ve şifre eşleşen kullanıcıyı bul
      const user = users.find(
        (u) => u.kullanici_mail === email && u.kullanici_sifre === password
      );

      if (user) {
        // 1) Context + localStorage'a kaydet
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        // Firma ID'sini ayrıca sakla
        localStorage.setItem('firma_id', user.firma_id);

        // 2) Anasayfa'ya yönlendir
        navigate("/Anasayfa");
      } else {
        window.alert("Email veya şifre hatalı.");
        setError("E-posta veya şifre hatalı.");
      }
    } catch (err) {
      console.error(err);
      setError("Sunucuya bağlanırken bir hata oluştu.");
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-blue-800 min-h-screen flex flex-col justify-center items-center">
      <div className="rounded-2xl shadow-2xl p-10 max-w-md bg-gray-900 text-white w-full border border-gray-700 relative animate-fade-in">
        <div className="flex justify-center mb-6 animate-bounce-once">
          <img
            src={Logo}
            alt="Website Logo"
            className="object-contain w-40 h-40 drop-shadow-lg"
          />
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="animate-slide-in-left">
            <label
              className="block text-gray-300 font-semibold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email adresinizi girin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="animate-slide-in-right">
            <label
              className="block text-gray-300 font-semibold mb-2"
              htmlFor="password"
            >
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Şifrenizi girin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <div className="animate-fade-in-delayed">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white font-bold py-3 px-4 rounded-lg shadow-lg"
            >
              Giriş Yap
            </button>
          </div>
        </form>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fadeIn 1s ease-in-out;
          }
          .animate-fade-in-delayed {
            animation: fadeIn 1s ease-in-out 0.5s both;
          }
          @keyframes bounceOnce {
            0% { transform: translateY(-10px); }
            50% { transform: translateY(5px); }
            100% { transform: translateY(0); }
          }
          .animate-bounce-once {
            animation: bounceOnce 0.8s ease-in-out;
          }
          @keyframes slideInLeft {
            from { transform: translateX(-50px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .animate-slide-in-left {
            animation: slideInLeft 1s ease-out;
          }
          @keyframes slideInRight {
            from { transform: translateX(50px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .animate-slide-in-right {
            animation: slideInRight 1s ease-out;
          }
        `}
      </style>
    </div>
  );
}

export default Login;
