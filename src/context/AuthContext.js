import React, { createContext, useState, useEffect } from "react";

// 1) Context’i yarat
export const AuthContext = createContext(null);

// 2) Provider bileşeni
export const AuthProvider = ({ children }) => {
  // Başlangıçta localStorage'dan oku, yoksa null
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // user her değiştiğinde localStorage’a kaydet
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
