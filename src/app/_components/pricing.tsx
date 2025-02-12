"use client";

import React from "react";
import Button from "./button";

export default function Pricing() {
  return (
    <section className="py-16 bg-white text-black" id="pricing">
      <div className="container mx-auto px-6">
        <div className="text-center py-16">
          <h1 className="text-3xl font-semibold">
            Puedes escoger distintos trackers segun tus necesidades
          </h1>
          <h3 className="text-1xl font-semibold">
            Mientras mas trackers, es mas preciso y estable el movimiento. Todos
            son de tamaño 4.3 x 4.3 x 1.5 cm
          </h3>
        </div>
        {/* Aquí cambiamos el Flex por un Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Plan 1 */}
          <div className="bg-white p-8 rounded-lg shadow-lg transform transition hover:scale-105 duration-300 ease-in-out">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Pack Básico
            </h2>
            <p className="text-4xl font-bold text-gray-900 mb-4">$240USD</p>
            <ul className="space-y-4 mb-6 text-black">
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                6 trackers autocalibrados
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Sensor LSM6DSR
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Drifting 30 minutos
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                10 horas de batería
              </li>
            </ul>
            <Button
              text="Encargar"
              link="https://wa.me/56975746099?text=Hola, quiero encargar un pack de trackers basicos!"
            />
          </div>

          {/* Plan 2 */}
          <div className="bg-white p-8 rounded-lg shadow-lg transform transition hover:scale-105 duration-300 ease-in-out">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Pack Ultimate
            </h2>
            <p className="text-4xl font-bold text-gray-900 mb-4">$500USD</p>
            <ul className="space-y-4 mb-6 text-black">
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                10 trackers autocalibrados
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Sensor ICM-45686
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Drifting 45 minutos
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                10 horas de batería
              </li>
            </ul>
            <Button
              text="Encargar"
              link="https://wa.me/56975746099?text=Hola, quiero encargar un pack de trackers ultimate!"
            />
          </div>

          {/* Plan 3 */}
          <div className="bg-white p-8 rounded-lg shadow-lg transform transition hover:scale-105 duration-300 ease-in-out">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Pack Custom
            </h2>
            <p className="text-4xl font-bold text-gray-900 mb-4">Consulta</p>
            <ul className="space-y-4 mb-6 text-black">
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Desde 6 hasta 20 trackers autocalibrados
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Sensor LSM6DSR o ICM-45686
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                10 horas de batería
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Colores personalizados
              </li>
            </ul>
            <Button
              text="Consulta"
              link="https://wa.me/56975746099?text=Hola, quiero consultar por trackers custom!"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
