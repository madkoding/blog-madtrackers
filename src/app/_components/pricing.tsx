"use client";

import React, { useState } from "react";

const sensors = [
  {
    id: "sensor1",
    label: "LSM6DSR",
    price: 40,
  },
  {
    id: "sensor2",
    label: "ICM45686",
    price: 80,
  },
];

const quantities = [6, 8, 10, 20];

const colors = [
  { id: "white", label: "Blanco", color: "bg-white border-gray-400" },
  { id: "black", label: "Negro", color: "bg-black text-white" },
  { id: "red", label: "Rojo", color: "bg-red-500" },
  { id: "blue", label: "Azul", color: "bg-blue-500" },
  { id: "purple", label: "Morado", color: "bg-purple-500" },
  { id: "yellow", label: "Amarillo", color: "bg-yellow-500" },
  { id: "green", label: "Verde", color: "bg-green-500" },
  { id: "orange", label: "Naranja", color: "bg-orange-500" },
  { id: "pink", label: "Rosa", color: "bg-pink-500" },
  { id: "gray", label: "Gris", color: "bg-gray-500" },
  { id: "brown", label: "Marrón", color: "bg-yellow-900" },
];

export default function Pricing() {
  const [selectedSensor, setSelectedSensor] = useState(sensors[0]);
  const [selectedQuantity, setSelectedQuantity] = useState(quantities[0]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  const totalPrice = selectedSensor.price * selectedQuantity;

  return (
    <section className="py-16 bg-white text-black" id="pricing">
      <div className="container mx-auto px-6">
        <div className="text-center py-8">
          <h1 className="text-3xl font-semibold">
            Arma tus trackers según tus necesidades
          </h1>
          <h3 className="text-1xl font-semibold">
            Mientras más trackers, es más preciso y estable el movimiento. Todos
            son de tamaño 4.3 x 4.3 x 1.5 cm
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
                  className={`px-4 py-2 rounded-lg border-2 ${
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
            <h3 className="font-medium mb-2">Color:</h3>
            <div className="flex justify-center gap-2">
              {colors.map((color) => (
                <button
                  key={color.id}
                  className={`w-10 h-10 rounded-full border-2 ${color.color} ${
                    selectedColor.id === color.id ? "ring-2 ring-black" : ""
                  }`}
                  onClick={() => setSelectedColor(color)}
                ></button>
              ))}
            </div>
          </div>

          {/* Precio Total */}
          <div className="text-center mt-6">
            <h2 className="text-xl font-semibold">
              Precio Total: ${totalPrice} USD
            </h2>
          </div>

          <p className="py-4 text-center">
            Los trackers se fabrican a pedido, y demora al rededor de 1 mes
          </p>

          <button
            className="mx-auto lg:mx-0 hover:underline bg-white text-gray-800 font-bold rounded-full mt-4 lg:mt-0 py-4 px-8 shadow opacity-75 focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
            onClick={() => {
              const message = encodeURIComponent(
                `Hola, quiero encargar estos trackers. 
                - Sensor: ${selectedSensor.label} 
                - Cantidad: ${selectedQuantity} 
                - Color: ${selectedColor.label}`
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
