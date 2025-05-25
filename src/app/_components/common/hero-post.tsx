"use client";

import RotatingFBXModel from "../RotatingFBXModel";
import { useLang } from "../../lang-context";
import { translations } from "../../i18n";

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
            <div className="w-full max-w-[600px] h-auto aspect-square">
              <RotatingFBXModel
                colors={["#444444", "#000000", "#FFFFFF", "#FFFFFF"]}
              />
            </div>
          </div>

          {/* Texto */}
          <div className="flex flex-col w-full md:w-2/5 justify-center items-start text-center md:text-left">
            <p className="tracking-loose w-full text-center md:text-left">
              {t.heroSlogan}
            </p>

            <div className="flex flex-col w-full md:w-2/5 justify-center items-center text-center">
              <h1 className="my-0 text-5xl font-bold leading-tight">{title}</h1>
              <h3 className="my-0 text-2xl font-bold leading-tight">
                {subtitle}
              </h3>
            </div>

            <p className="my-4 leading-normal text-xl mb-8">{t.heroExcerpt}</p>
            <a
              href="#pricing"
              className="mx-auto lg:mx-0 hover:underline bg-white text-gray-800 font-bold rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
            >
              {t.heroButton}
            </a>

            <p>&nbsp;</p>
            <p>&nbsp;</p>
          </div>
        </div>
      </div>
    </section>
  );
}
