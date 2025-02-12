"use client";

import React, { useState, useEffect } from "react";
import RotatingFBXModel from "./RotatingFBXModel";

// Definir un tipo específico para las monedas
type Currency = "CLP" | "PEN" | "ARS" | "MXN" | "USD";

const sensors = [
  {
    id: "sensor1",
    label: "LSM6DSR",
    description: "Buena calidad de seguimiento, drifting a los 30 minutos",
    price: 40000,
  },
  {
    id: "sensor2",
    label: "ICM45686",
    description: "Excelente calidad de seguimiento, drifting a los 45 minutos",
    price: 80000,
  },
];

const quantities = [6, 8, 10, 20];

const colors = [
  {
    id: "white",
    label: "Blanco",
    color: "bg-white border-gray-400",
    hex: "#FFFFFF",
  },
  { id: "black", label: "Negro", color: "bg-black text-white", hex: "#444444" },
  { id: "red", label: "Rojo", color: "bg-red-500", hex: "#F87171" },
  { id: "blue", label: "Azul", color: "bg-blue-500", hex: "#3B82F6" },
  { id: "purple", label: "Morado", color: "bg-purple-500", hex: "#A855F7" },
  { id: "yellow", label: "Amarillo", color: "bg-yellow-500", hex: "#F59E0B" },
  { id: "green", label: "Verde", color: "bg-green-500", hex: "#10B981" },
  { id: "orange", label: "Naranja", color: "bg-orange-500", hex: "#FB923C" },
  { id: "pink", label: "Rosa", color: "bg-pink-500", hex: "#EC4899" },
  { id: "gray", label: "Gris", color: "bg-gray-500", hex: "#6B7280" },
];

// Tasas de cambio ficticias
const exchangeRates: Record<Currency, number> = {
  CLP: 1,
  PEN: 0.0038,
  ARS: 1.1,
  MXN: 0.022,
  USD: 0.0011,
};

// Costos de envío en CLP
const shippingCosts = {
  national: 5000,
  international: 60000,
};

// Símbolos de moneda
const currencySymbols: Record<Currency, string> = {
  CLP: "$",
  PEN: "S/",
  ARS: "$",
  MXN: "$",
  USD: "US$",
};

export default function Pricing() {
  const [selectedSensor, setSelectedSensor] = useState(sensors[0]);
  const [selectedQuantity, setSelectedQuantity] = useState(quantities[0]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [isNational, setIsNational] = useState(true);

  // Detectar país del usuario
  useEffect(() => {
    async function fetchLocation() {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        const country = data.country_code;

        let selectedCurrency: Currency = "USD";
        let national = false;

        if (country === "CL") {
          selectedCurrency = "CLP";
          national = true;
        }
        if (country === "PE") selectedCurrency = "PEN";
        if (country === "AR") selectedCurrency = "ARS";
        if (country === "MX") selectedCurrency = "MXN";

        setCurrency(selectedCurrency);
        setExchangeRate(exchangeRates[selectedCurrency]);
        setIsNational(national);
      } catch (error) {
        console.error("Error obteniendo ubicación:", error);
      }
    }

    fetchLocation();
  }, []);

  // Calcular precio total en la moneda correcta
  const totalPrice = (
    selectedSensor.price *
    selectedQuantity *
    exchangeRate
  ).toFixed(0);

  // Calcular costo de envío en la moneda correcta
  const shippingPrice = (
    (isNational ? shippingCosts.national : shippingCosts.international) *
    exchangeRate
  ).toFixed(0);

  // Formatear número con separador de miles
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-ES").format(price);
  };

  return (
    <section className="py-16 bg-white text-black" id="pricing">
      <div className="container mx-auto px-6">
        <div className="text-center py-8">
          <h1 className="text-3xl font-semibold">
            Arma tus trackers según tus necesidades
          </h1>
          <h3 className="text-sm font-semibold">
            El movimiento es más preciso a mayor cantidad
          </h3>
          <h3 className="text-sm font-semibold">
            Todos son de tamaño 4.3 x 4.3 x 1.5 cm
          </h3>
        </div>
        <div className="bg-gray-100 p-6 rounded-lg shadow-lg max-w-lg mx-auto text-center">
          {/* Selección de Sensor */}
          <div className="mb-4">
            <h3 className="font-medium mb-2">Tipo de Sensor:</h3>
            <div className="flex justify-center gap-4">
              {sensors.map((sensor) => (
                <button
                  key={sensor.id}
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
                    selectedSensor.id === sensor.id
                      ? "border-black bg-gray-300"
                      : "border-gray-300"
                  }`}
                  onClick={() => setSelectedSensor(sensor)}
                >
                  {sensor.label}
                </button>
              ))}
            </div>
            <div className="flex justify-center gap-4">
              {sensors.map((sensor) => (
                <p className="text-center px-4 py-2 text-xs" key={sensor.id}>
                  {sensor.description}
                </p>
              ))}
            </div>
          </div>

          {/* Selección de Cantidad */}
          <div className="mb-4">
            <h3 className="font-medium mb-2">Cantidad:</h3>
            <div className="flex justify-center gap-2 flex-wrap">
              {quantities.map((qty) => (
                <button
                  key={qty}
                  className={`px-4 py-2 rounded-lg border-2 ${
                    selectedQuantity === qty
                      ? "border-black bg-gray-300"
                      : "border-gray-300"
                  }`}
                  onClick={() => setSelectedQuantity(qty)}
                >
                  {qty}
                </button>
              ))}
            </div>
          </div>

          {/* Selección de Color */}
          <div className="mb-4">
            <div className="w-full max-w-[600px] h-auto aspect-square">
              <RotatingFBXModel color={selectedColor.hex} />
            </div>
            <h3 className="font-medium mb-2">Color:</h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2 justify-center">
              {colors.map((color) => (
                <div
                  key={color.id}
                  className="flex justify-center items-center"
                >
                  <button
                    className={`w-10 h-10 rounded-full border-2 ${
                      color.color
                    } ${
                      selectedColor.id === color.id ? "ring-2 ring-black" : ""
                    }`}
                    onClick={() => setSelectedColor(color)}
                  ></button>
                </div>
              ))}
            </div>
          </div>

          {/* Precio Total */}
          <div className="text-center mt-6">
            <h2 className="text-xl font-semibold">
              Precio Total: {currencySymbols[currency]}
              {formatPrice(Number(totalPrice))} {currency}
            </h2>
            <p className="text-gray-600 text-center">
              Envío desde: {currencySymbols[currency]}
              {formatPrice(Number(shippingPrice))} {currency}
            </p>
            <br />
            <p className="text-center">
              Los trackers se hacen a pedido y toman al rededor de 1 mes en
              armar
            </p>
          </div>

          <button
            className="mx-auto hover:underline bg-white text-gray-800 font-bold rounded-full mt-4 py-4 px-8 shadow opacity-75 focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
            onClick={() => {
              const message = encodeURIComponent(
                `Hola, quiero encargar estos trackers. 
- Sensor: ${selectedSensor.label} 
- Cantidad: ${selectedQuantity} 
- Color: ${selectedColor.label}
- Precio Total: ${currencySymbols[currency]}${formatPrice(
                  Number(totalPrice)
                )} ${currency}
- Envío: ${currencySymbols[currency]}${formatPrice(
                  Number(shippingPrice)
                )} ${currency}`
              );

              window.open(
                `https://wa.me/56975746099?text=${message}`,
                "_blank"
              );
            }}
          >
            Encarga los tuyos!
          </button>
        </div>
      </div>
    </section>
  );
}
