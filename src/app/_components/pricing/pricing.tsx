"use client";

import React, { useState, useEffect } from "react";
import { quantities, countries, useTranslatedConstants } from "../../constants";
import { translations } from "../../i18n";
import { useLang } from "../../lang-context";
import { Sensor, Currency, TrackerType } from "../../types";
import { usePricing } from "../../../hooks/usePricing";
import SensorSelector from "./sensor-selector";
import QuantitySelector from "./quantity-selector";
import ColorSelector from "./color-selector";
import PricingSummary from "./pricing-summary";
import ImageWithPoints from "./image-with-points";
import PaypalButton from "./paypal";
import FlowPayment from "./flow-payment";

const Pricing = () => {
  const {
    sensors: sensorsT,
    trackers: trackersT,
    colors: colorsT,
  } = useTranslatedConstants();

  const [selectedSensor, setSelectedSensor] = useState<Sensor>(sensorsT[0]);
  const [selectedTrackerType, setSelectedTrackerType] = useState<TrackerType>(
    trackersT[0]
  );
  const [selectedQuantity, setSelectedQuantity] = useState<number>(
    quantities[0]
  );
  const [selectedColorTapa, setSelectedColorTapa] = useState(colorsT[0]);
  const [selectedColorCase, setSelectedColorCase] = useState(colorsT[0]);

  // Estado para el país seleccionado para cálculos de precio
  const [countryCode, setCountryCode] = useState<string>("US");

  /** Moneda local (ej: "USD", "CLP", etc.) */
  const [currency, setCurrency] = useState<Currency>(countries.US.currency);
  /** Símbolo de la moneda local */
  const [currencySymbol, setCurrencySymbol] = useState<string>(
    countries.US.currencySymbol
  );

  const { lang } = useLang();
  const t = translations[lang];

  // Hook para obtener precios desde el backend
  const { pricing } = usePricing({
    sensorId: selectedSensor.id,
    trackerId: selectedTrackerType.id,
    quantity: selectedQuantity,
    countryCode
  });

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("es-ES").format(Number(price));
  };

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
              cachedAt: Date.now() 
            })
          );
        }
      } catch (error) {
        console.error("Error obteniendo configuración de país:", error);
      }
    }

    fetchCountryConfig();
  }, []);

  useEffect(() => {
    // Si selecciona el tracker pero el sensor no está disponible, selecciona el primero
    if (
      !selectedSensor.available?.includes(selectedTrackerType.id) &&
      selectedTrackerType.id !== "none"
    ) {
      setSelectedSensor(sensorsT[0]);
    }
  }, [selectedTrackerType, selectedSensor.available, sensorsT]);

  useEffect(() => {
    setSelectedSensor(sensorsT[0]);
    setSelectedTrackerType(trackersT[0]);
    setSelectedColorTapa(colorsT[0]);
    setSelectedColorCase(colorsT[0]);
  }, [sensorsT, trackersT, colorsT]);

  // Precios desde el backend a través del hook
  const totalPrice = pricing?.prices.totalLocal.toString() || "0";
  const shippingPrice = pricing?.prices.shippingLocal.toString() || "0";
  const exchangeRate = pricing?.currency.exchangeRate || 1;

  return (
    <section className="py-16 px-4 bg-white text-black">
      <div className="bg-gray-100 p-4 rounded-lg shadow-lg max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-semibold">
          {t.buildYourTrackers}
        </h1>
        <h3 className="text-sm font-semibold">{t.precisionWithTrackers}</h3>
        <br />
        <SensorSelector
          sensors={sensorsT.filter(
            (sensor) =>
              sensor.available?.includes(selectedTrackerType.id) ?? false
          )}
          selectedSensor={selectedSensor}
          setSelectedSensor={setSelectedSensor}
        />
        <hr /><br /><br />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center items-center">
          {/* <TrackerTypeSelector
            trackerTypes={trackers}
            selectedTrackerType={selectedTrackerType}
            setSelectedTrackerType={setSelectedTrackerType}
          /> */}

          <QuantitySelector
            quantities={quantities}
            selectedQuantity={selectedQuantity}
            setSelectedQuantity={setSelectedQuantity}
          />
          <ImageWithPoints selectedQuantity={selectedQuantity} />
          
          <ColorSelector
            colors={colorsT}
            selectedColorTapa={selectedColorTapa}
            selectedColorCase={selectedColorCase}
            onColorTapaChange={setSelectedColorTapa}
            onColorCaseChange={setSelectedColorCase}
          />
        </div>
        <br />
        <hr />

        <PricingSummary
          totalPrice={totalPrice}
          shippingPrice={shippingPrice}
          currency={currency}
          currencySymbol={currencySymbol}
          exchangeRate={exchangeRate}
        />

        <h3 className="p-5 text-sm font-semibold">{t.buildTime}</h3>
        <h3 className="p-3 text-sm font-semibold">{t.includes}</h3>
        <h3 className="p-3 text-sm font-semibold">
          {t.partialPayment}
          {currencySymbol +
            formatPrice((parseFloat(totalPrice) / 4).toString()) +
            " " +
            currency}
          , {t.continuePayment}.
        </h3>
        <button
          className="mx-auto hover:underline bg-green-500 hover:bg-green-600 text-white font-bold rounded-full mt-4 py-4 px-8 shadow opacity-100 focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out flex items-center justify-center gap-2"
          onClick={() => {
            const message = encodeURIComponent(
              `Hola, quiero encargar estos trackers.
- País: ${currency}
- Tipo de tracker: ${selectedTrackerType.label}
- Sensor: ${selectedSensor.label} 
- Cantidad: ${selectedQuantity}
- Color de la tapa: ${selectedColorTapa.label}
- Color del case: ${selectedColorCase.label}
- Precio total: $${pricing?.prices.totalUsd || 0} USD`
            );

            window.open(`https://wa.me/56975746099?text=${message}`, "_blank");
          }}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            className="inline-block"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.384"/>
          </svg>
          {t.askNow}
        </button>

        <br />
        {currency === "CLP" ? (
          <FlowPayment
            amount={(parseFloat(totalPrice) / 4)}
            description={`MadTrackers - ${selectedTrackerType.label} x${selectedQuantity}`}
          />
        ) : (
          <PaypalButton 
            amount={(pricing?.prices.totalUsd || 0) / 4} // Precio del anticipo (25%) en USD
            description={`MadTrackers - ${selectedTrackerType.label} x${selectedQuantity}`}
          />
        )}
      </div>
    </section>
  );
};

export default Pricing;
