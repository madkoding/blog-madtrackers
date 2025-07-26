"use client";

import { useLang } from "../../lang-context";
import { translations } from "../../i18n";

const BrandBenefits = () => {
  const { lang } = useLang();
  const t = translations[lang];

  const benefits = [
    {
      icon: (
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: t.benefit1Title,
      description: t.benefit1Desc,
    },
    {
      icon: (
        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t.benefit2Title,
      description: t.benefit2Desc,
    },
    {
      icon: (
        <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      ),
      title: t.benefit3Title,
      description: t.benefit3Desc,
    },
    {
      icon: (
        <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      title: t.benefit4Title,
      description: t.benefit4Desc,
    },
  ];

  return (
    <section className="py-16  bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t.brandBenefitTitle}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 bg-gray-50 rounded-full group-hover:bg-gray-100 transition-colors duration-300">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Technical stats section */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="group">
              <div className="text-3xl font-bold text-blue-600 mb-2">50-70h</div>
              <div className="text-sm text-gray-600">{lang === 'es' ? 'Batería' : 'Battery'}</div>
            </div>
            <div className="group">
              <div className="text-3xl font-bold text-green-600 mb-2">25g</div>
              <div className="text-sm text-gray-600">{lang === 'es' ? 'Peso' : 'Weight'}</div>
            </div>
            <div className="group">
              <div className="text-3xl font-bold text-purple-600 mb-2">38x38x10</div>
              <div className="text-sm text-gray-600">{lang === 'es' ? 'Tamaño (mm)' : 'Size (mm)'}</div>
            </div>
            <div className="group">
              <div className="text-3xl font-bold text-orange-600 mb-2">RF</div>
              <div className="text-sm text-gray-600">{lang === 'es' ? 'Tecnología' : 'Technology'}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandBenefits;
