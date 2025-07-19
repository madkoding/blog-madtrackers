"use client";

import { useLang } from "../../lang-context";
import { translations } from "../../i18n";
import RotatingModel from "../RotatingModel";

type Props = {
  title: string;
  subtitle: string;
};

export function HeroPost({ title, subtitle }: Readonly<Props>) {
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <section>
      <div className="pt-16">
        <div className="container px-3 mx-auto flex flex-wrap flex-col md:flex-row items-center">
          {/* Modelo 3D */}
          <div className="w-full md:w-3/5 flex justify-center items-center">
            <div className="w-full max-w-[500px] max-h-[500px] h-auto aspect-square">
              <RotatingModel
                colors={["#444444", "#000000", "#FFFFFF", "#FFFFFF"]}
              />
            </div>
          </div>

          {/* Texto */}
          <div className="flex flex-col w-full md:w-2/5 justify-center items-center md:items-start text-center md:text-left">
            <p className="tracking-loose w-full text-center md:text-left">
              {t?.heroSlogan || "Made by a VRChat fan for VRChat fans"}
            </p>

            <div className="flex flex-col w-full">
              <h1 className="my-0 text-5xl font-bold leading-tight">{title}</h1>
              <h3 className="my-0 text-2xl font-bold leading-tight">
                {subtitle}
              </h3>
            </div>

            <p className="w-full my-4 leading-normal text-xs mb-8 text-center md:text-left">
              {t?.heroExcerpt || "Wireless motion capture sensors for real-time animation"}
            </p>

            <a
              href="#pricing"
              className="hover:underline bg-white text-gray-800 font-bold rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
            >
              {t?.heroButton || "Order a pack now!"}
            </a>

            <div className="h-8" />
          </div>
        </div>
      </div>
    </section>
  );
}
