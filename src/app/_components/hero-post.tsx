"use client";

import RotatingFBXModel from "./RotatingFBXModel";

type Props = {
  title: string;
  coverImage: string;
  excerpt: string;
  slug: string;
};

export function HeroPost({
  title,
  coverImage,
  excerpt,
  slug,
}: Readonly<Props>) {
  return (
    <section>
      <div className="pt-16">
        <div className="container px-3 mx-auto flex flex-wrap flex-col md:flex-row items-center">
          {/* Texto */}
          <div className="flex flex-col w-full md:w-2/5 justify-center items-start text-center md:text-left">
            <p className="uppercase tracking-loose w-full">
              Hecho por un fan de VRChat para fans de VRChat
            </p>
            <h1 className="my-4 text-5xl font-bold leading-tight">{title}</h1>
            <p className="leading-normal text-xl mb-8">{excerpt}</p>
            <button
              onClick={() =>
                window.open(
                  "https://wa.me/56975746099?text=Hola, quiero encargar un pack de trackers!",
                  "_blank"
                )
              }
              className="mx-auto lg:mx-0 hover:underline bg-white text-gray-800 font-bold rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
            >
              Encargar un pack ahora!
            </button>
          </div>

          {/* Modelo 3D */}
          <div className="w-full md:w-3/5 flex justify-center items-center">
            <div className="w-full max-w-[600px] h-auto aspect-square">
              <RotatingFBXModel />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
