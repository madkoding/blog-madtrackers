"use client";

import { useLang } from "../../lang-context";
import Link from "next/link";

interface Country {
  name: string;
  code: string;
  link: string;
  flag: string;
  shipping: "free" | "ups";
}

const ShippingCountries = () => {
  const { lang } = useLang();

  // Países simplificados - sin animaciones complejas
  const countries: Country[] = [
    { name: "Chile", code: "cl", link: "/trackers-slimevr-chile", flag: "🇨🇱", shipping: "free" },
    { name: "Argentina", code: "ar", link: "/trackers-slimevr-argentina", flag: "🇦🇷", shipping: "ups" },
    { name: "México", code: "mx", link: "/trackers-slimevr-mexico", flag: "🇲🇽", shipping: "ups" },
    { name: "Colombia", code: "co", link: "/posts/Envios_Internacionales_Trackers_SlimeVR", flag: "🇨🇴", shipping: "ups" },
    { name: "Perú", code: "pe", link: "/posts/Envios_Internacionales_Trackers_SlimeVR", flag: "🇵🇪", shipping: "ups" },
    { name: "Estados Unidos", code: "us", link: "/posts/Envios_Internacionales_Trackers_SlimeVR", flag: "🇺🇸", shipping: "ups" },
    { name: "Canadá", code: "ca", link: "/posts/Envios_Internacionales_Trackers_SlimeVR", flag: "🇨🇦", shipping: "ups" },
    { name: "España", code: "es", link: "/trackers-slimevr-espana", flag: "🇪🇸", shipping: "ups" },
    { name: "Italia", code: "it", link: "/posts/Envios_Internacionales_Trackers_SlimeVR", flag: "🇮🇹", shipping: "ups" },
    { name: "Alemania", code: "de", link: "/posts/Envios_Internacionales_Trackers_SlimeVR", flag: "🇩🇪", shipping: "ups" },
  ];

  return (
    <div className="bg-gradient-to-b from-slate-200 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="container mx-auto px-4">
        <div className="w-full bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {lang === 'es' ? 'Envíos Internacionales' : 'International Shipping'}
            </h2>
            <p className="text-cyan-600 dark:text-cyan-300">
              {lang === 'es'
                ? 'Desde Chile hacia el mundo via UPS'
                : 'From Chile to the world via UPS'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {countries.map((country) => (
              <Link
                key={country.code}
                href={country.link}
                className="group relative flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-gray-100 dark:bg-slate-900/40 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all duration-200 hover:shadow-lg border-2 border-transparent hover:border-cyan-400"
              >
                <span className="text-4xl" aria-label={country.name}>
                  {country.flag}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white text-center">
                  {country.name}
                </span>
                
                {country.shipping === 'free' && (
                  <span className="absolute top-2 right-2 text-xs font-bold uppercase px-2 py-1 rounded-full bg-green-500 text-white">
                    {lang === 'es' ? 'Gratis' : 'Free'}
                  </span>
                )}
                
                {/* Indicador de hover */}
                <div className="absolute inset-0 rounded-lg bg-cyan-400/0 group-hover:bg-cyan-400/10 transition-colors pointer-events-none" />
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              {lang === 'es' 
                ? '✈️ Envío gratis en Chile • Envío internacional disponible via UPS'
                : '✈️ Free shipping in Chile • International shipping available via UPS'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingCountries;
