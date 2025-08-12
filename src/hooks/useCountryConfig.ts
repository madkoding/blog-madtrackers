"use client";

import { useState, useEffect } from "react";
import { countries } from "../app/constants";
import { Currency } from "../app/types";

export const useCountryConfig = () => {
  const [countryCode, setCountryCode] = useState<string>("US");
  const [currency, setCurrency] = useState<Currency>(countries.US.currency);
  const [currencySymbol, setCurrencySymbol] = useState<string>(countries.US.currencySymbol);

  useEffect(() => {
    const TTL = 2 * 60 * 1000; // 2 minutos en milisegundos

    async function fetchCountryConfig() {
      try {
        const stored = localStorage.getItem("currency");
        if (stored) {
          const data = JSON.parse(stored) as {
            currency: Currency;
            currencySymbol: string;
            cachedAt: number;
            countryCode: string;
          };

          // Si el cache no ha expirado, úsalo
          if (Date.now() - data.cachedAt < TTL) {
            setCurrency(data.currency);
            setCurrencySymbol(data.currencySymbol);
            setCountryCode(data.countryCode);
            return;
          }
        }

        // Cache expirado o no existe, volver a fetch
        const res = await fetch("https://ipapi.co/json/");
        const { country_code: fetchedCountryCode } = await res.json();
        const cfg = countries[fetchedCountryCode];
        if (cfg) {
          setCurrency(cfg.currency);
          setCurrencySymbol(cfg.currencySymbol);
          setCountryCode(fetchedCountryCode);

          // Guardar con timestamp
          localStorage.setItem(
            "currency",
            JSON.stringify({
              currency: cfg.currency,
              currencySymbol: cfg.currencySymbol,
              countryCode: fetchedCountryCode,
              cachedAt: Date.now(),
            })
          );
        }
      } catch (error) {
        console.error("Error obteniendo configuración de país:", error);
      }
    }

    fetchCountryConfig();
  }, []);

  return {
    countryCode,
    currency,
    currencySymbol,
    setCountryCode,
    setCurrency,
    setCurrencySymbol,
  };
};
