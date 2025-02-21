"use client";

import React, { useState, useEffect, useMemo } from "react";
import { sensors, quantities, colors, countries } from "../../constants";
import { Sensor, Color, Currency } from "../../types";
import SensorSelector from "./sensor-selector";
import QuantitySelector from "./quantity-selector";
import ColorSelector from "./color-selector";
import PricingSummary from "./pricing-summary";
import ImageWithPoints from "./image-with-points";
import Script from "next/script";
import PaypalButton from "./paypal";

const Pricing = () => {
  const [selectedSensor, setSelectedSensor] = useState<Sensor>(sensors[0]);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(
    quantities[0]
  );
  const [selectedColor, setSelectedColor] = useState<Color>(colors[0]);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [currencySymbol, setCurrencySymbol] = useState<string>("US$");
  const [shippingCost, setShippingCost] = useState<number>(60000);

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("es-ES").format(Number(price));
  };

  useEffect(() => {
    async function fetchCountryConfig() {
      try {
        // Intentar cargar desde localStorage
        const storedCurrency = localStorage.getItem("currency");
        if (storedCurrency) {
          const storedData = JSON.parse(storedCurrency);
          setCurrency(storedData.currency);
          setExchangeRate(storedData.exchangeRate);
          setCurrencySymbol(storedData.currencySymbol);
          setShippingCost(storedData.shippingCost);
          return;
        }

        // Obtener la IP del usuario
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        const countryCode = data.country_code;

        const countryData = countries[countryCode];
        if (countryData) {
          setCurrency(countryData.currency);
          setExchangeRate(countryData.exchangeRate);
          setCurrencySymbol(countryData.currencySymbol);
          setShippingCost(countryData.shippingCost);

          // Guardar en localStorage para futuras visitas
          localStorage.setItem("currency", JSON.stringify(countryData));
        }
      } catch (error) {
        console.error("Error obteniendo configuración de país:", error);
      }
    }

    fetchCountryConfig();
  }, []);

  // Calcular precios solo cuando cambian dependencias
  const totalPrice = useMemo(
    () => (selectedSensor.price * selectedQuantity * exchangeRate).toFixed(0),
    [selectedSensor, selectedQuantity, exchangeRate]
  );

  const shippingPrice = useMemo(
    () => (shippingCost * exchangeRate).toFixed(0),
    [shippingCost, exchangeRate]
  );

  return (
    <section className="py-16 px-4 bg-white text-black" id="pricing">
      <div className="bg-gray-100 p-4 rounded-lg shadow-lg max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-semibold">
          Arma tus trackers según tus necesidades
        </h1>
        <h3 className="text-sm font-semibold">
          El movimiento es más preciso a mayor cantidad
        </h3>
        <h3 className="text-sm font-semibold">
          Todos son de tamaño 4.3 x 4.3 x 1.5 cm
        </h3>
        <br />
        <SensorSelector
          sensors={sensors}
          selectedSensor={selectedSensor}
          setSelectedSensor={setSelectedSensor}
        />
        <br />
        <QuantitySelector
          quantities={quantities}
          selectedQuantity={selectedQuantity}
          setSelectedQuantity={setSelectedQuantity}
        />
        <ImageWithPoints selectedQuantity={selectedQuantity} />
        <br />
        <ColorSelector
          colors={colors}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
        />
        <br />
        <PricingSummary
          totalPrice={totalPrice}
          shippingPrice={shippingPrice}
          currency={currency}
          currencySymbol={currencySymbol}
        />

        <button
          className="mx-auto hover:underline bg-purple-900 text-white font-bold rounded-full mt-4 py-4 px-8 shadow opacity-100 focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
          onClick={() => {
            const message = encodeURIComponent(
              `Hola, quiero encargar estos trackers. 
- Sensor: ${selectedSensor.label} 
- Cantidad: ${selectedQuantity} 
- Color: ${selectedColor.label}`
            );

            window.open(`https://wa.me/56975746099?text=${message}`, "_blank");
          }}
        >
          Consulta por tuyos ahora!
        </button>
        <br />
        <br />
        <PaypalButton />
        <h3 className="p-5 text-sm font-semibold">
          La construcción de un pack de trackers toma al rededor de 1 mes
        </h3>
        <h3 className="px-10 text-sm font-semibold">
          Si no cuentas con el monto total, puedes realizar pagos parciales
          mientras se preparan los trackers. El primer abono es de{" "}
          {currencySymbol +
            formatPrice((parseFloat(totalPrice) / 4).toString()) +
            " " +
            currency}
          , y podrás continuar abonando hasta cubrir el total.
        </h3>
      </div>
    </section>
  );
};

export default Pricing;
