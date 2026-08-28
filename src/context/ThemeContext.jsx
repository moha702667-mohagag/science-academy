import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {

    const html = document.documentElement;
    const body = document.body;

    // =========================================
    // HTML
    // =========================================

    html.setAttribute("data-theme", theme);

    // =========================================
    // BODY
    // =========================================

    if (theme === "dark") {

      body.classList.add("dark-mode");

    } else {

      body.classList.remove("dark-mode");

    }

    // =========================================
    // Save
    // =========================================

    localStorage.setItem("theme", theme);

  }, [theme]);


  const toggleTheme = () => {

    setTheme((prev) =>
      prev === "light"
        ? "dark"
        : "light"
    );

  };


  return (

    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >

      {children}

    </ThemeContext.Provider>

  );

}


export function useTheme() {

  return useContext(ThemeContext);

}