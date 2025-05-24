"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  sensors,
  quantities,
  colors,
  countries,
  trackers,
} from "../../constants";
import { Sensor, Color, Currency, TrackerType } from "../../types";
import SensorSelector from "./sensor-selector";
import QuantitySelector from "./quantity-selector";
import ColorSelector from "./color-selector";
import PricingSummary from "./pricing-summary";
import ImageWithPoints from "./image-with-points";
import PaypalButton from "./paypal";
import TrackerTypeSelector from "./tracker-type";

const Pricing = () => {
  const [selectedSensor, setSelectedSensor] = useState<Sensor>(sensors[0]);
  const [selectedTrackerType, setSelectedTrackerType] = useState<TrackerType>(
    trackers[0]
  );
  const [selectedQuantity, setSelectedQuantity] = useState<number>(
    quantities[0]
  );
  const [selectedColor, setSelectedColor] = useState<Color>(colors[0]);

  /** Moneda local (ej: "USD", "CLP", etc.) */
  const [currency, setCurrency] = useState<Currency>(countries.US.currency);
  /** Tasa USD→moneda local */
  const [exchangeRate, setExchangeRate] = useState<number>(
    countries.US.exchangeRate
  );
  /** Símbolo de la moneda local */
  const [currencySymbol, setCurrencySymbol] = useState<string>(
    countries.US.currencySymbol
  );
  /** Costo de envío base en USD */
  const [shippingCostUsd, setShippingCostUsd] = useState<number>(
    countries.US.shippingCostUsd
  );

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
            exchangeRate: number;
            currencySymbol: string;
            shippingCostUsd: number;
            cachedAt: number;
          };

          // Si el cache no ha expirado, úsalo
          if (Date.now() - data.cachedAt < TTL) {
            setCurrency(data.currency);
            setExchangeRate(data.exchangeRate);
            setCurrencySymbol(data.currencySymbol);
            setShippingCostUsd(data.shippingCostUsd);
            return;
          }
        }

        // Cache expirado o no existe, volver a fetch
        const res = await fetch("https://ipapi.co/json/");
        const { country_code: countryCode } = await res.json();
        const cfg = countries[countryCode];
        if (cfg) {
          setCurrency(cfg.currency);
          setExchangeRate(cfg.exchangeRate);
          setCurrencySymbol(cfg.currencySymbol);
          setShippingCostUsd(cfg.shippingCostUsd);

          // Guardar con timestamp
          localStorage.setItem(
            "currency",
            JSON.stringify({ ...cfg, cachedAt: Date.now() })
          );
        }
      } catch (error) {
        console.error("Error obteniendo configuración de país:", error);
      }
    }

    fetchCountryConfig();
  }, []);

  useEffect(() => {
    // Si seleeciona el tracker pero el sensor no está disponible, selecciona el primero
    if (
      !selectedSensor.available?.includes(selectedTrackerType.id) &&
      selectedTrackerType.id !== "none"
    ) {
      setSelectedSensor(sensors[0]);
    }
  }, [selectedTrackerType]);

  // Precio total (USD→local)
  const totalPrice = useMemo(
    () =>
      (
        selectedTrackerType.price *
        selectedSensor.price *
        selectedQuantity *
        exchangeRate
      ).toFixed(0),
    [selectedTrackerType, selectedSensor, selectedQuantity, exchangeRate]
  );

  // Costo de envío (USD→local)
  const shippingPrice = useMemo(
    () => (shippingCostUsd * exchangeRate).toFixed(0),
    [shippingCostUsd, exchangeRate]
  );

  return (
    <section className="py-16 px-4 bg-white text-black" id="pricing">
      <div className="bg-gray-100 p-4 rounded-lg shadow-lg max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-semibold">
          Arma tus trackers según tus necesidades
        </h1>
        <h3 className="text-sm font-semibold">
          El movimiento es más preciso a mayor cantidad de trackers
        </h3>
        <br />
        <SensorSelector
          sensors={sensors.filter(
            (sensor) =>
              sensor.available?.includes(selectedTrackerType.id) ?? false
          )}
          selectedSensor={selectedSensor}
          setSelectedSensor={setSelectedSensor}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
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
            colors={colors}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />
        </div>

        <PricingSummary
          totalPrice={totalPrice}
          shippingPrice={shippingPrice}
          currency={currency}
          currencySymbol={currencySymbol}
          exchangeRate={exchangeRate}
        />

        <button
          className="mx-auto hover:underline bg-purple-900 text-white font-bold rounded-full mt-4 py-4 px-8 shadow opacity-100 focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
          onClick={() => {
            const message = encodeURIComponent(
              `Hola, quiero encargar estos trackers.
- País: ${currency}
- Tipo de tracker: ${selectedTrackerType.label}
- Sensor: ${selectedSensor.label} 
- Cantidad: ${selectedQuantity} 
- Color: ${selectedColor.label}`
            );

            window.open(`https://wa.me/56975746099?text=${message}`, "_blank");
          }}
        >
          Consulta por tuyos ahora!
        </button>
        <h3 className="p-5 text-sm font-semibold">
          La construcción de un pack de trackers toma al rededor de 1 mes
        </h3>
        <h3 className="p-3 text-sm font-semibold">
          Todos los trackers incluen straps con silicona y baterías
        </h3>
        <h3 className="p-3 text-sm font-semibold">
          Si no cuentas con el monto total, puedes realizar pagos parciales
          mientras se preparan los trackers. El primer abono es de{" "}
          {currencySymbol +
            formatPrice((parseFloat(totalPrice) / 4).toString()) +
            " " +
            currency}
          , y podrás continuar abonando hasta cubrir el total.
        </h3>
        <br />
        <PaypalButton />
      </div>
    </section>
  );
};

export default Pricing;
