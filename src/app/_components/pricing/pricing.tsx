"use client";

import React, { useState, useEffect } from "react";
import { quantities, countries, useTranslatedConstants } from "../../constants";
import { translations } from "../../i18n";
import { useLang } from "../../lang-context";
import { Sensor, Currency, TrackerType } from "../../types";
import { usePricing } from "../../../hooks/usePricing";
import { useRecaptcha } from "../../../hooks/useRecaptcha";
import QuantitySelector from "./quantity-selector";
import ColorSelector from "./color-selector";
import PricingSummary from "./pricing-summary";
import ImageWithPoints from "./image-with-points";
import PaypalButton from "./paypal";
import FlowPayment from "./flow-payment";

const Pricing = () => {
  const {
    sensors: sensorsT,
    trackers: trackersT,
    colors: colorsT,
  } = useTranslatedConstants();

  const [selectedSensor, setSelectedSensor] = useState<Sensor>(sensorsT[0]);
  const [selectedTrackerType, setSelectedTrackerType] = useState<TrackerType>(
    trackersT[0]
  );
  const [selectedQuantity, setSelectedQuantity] = useState<number>(
    quantities[0]
  );
  const [selectedColorTapa, setSelectedColorTapa] = useState(colorsT[0]);
  const [selectedColorCase, setSelectedColorCase] = useState(colorsT[0]);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  
  // Contact form states
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Estado para el país seleccionado para cálculos de precio
  const [countryCode, setCountryCode] = useState<string>("US");

  /** Moneda local (ej: "USD", "CLP", etc.) */
  const [currency, setCurrency] = useState<Currency>(countries.US.currency);
  /** Símbolo de la moneda local */
  const [currencySymbol, setCurrencySymbol] = useState<string>(
    countries.US.currencySymbol
  );

  const { lang } = useLang();
  const t = translations[lang];
  const { executeRecaptcha } = useRecaptcha();

  // Hook para obtener precios desde el backend
  const { pricing, loading: pricingLoading, error: pricingError } = usePricing({
    sensorId: selectedSensor.id,
    trackerId: selectedTrackerType.id,
    quantity: selectedQuantity,
    countryCode
  });

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isModalOpen]);

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("es-ES").format(Number(price));
  };

  // Validar que los precios sean válidos antes de mostrar los botones de pago
  const isPricingValid = pricing && 
    pricing.prices.totalLocal > 0 && 
    pricing.prices.totalUsd > 0 && 
    !pricingLoading && 
    !pricingError;

  useEffect(() => {
    const TTL = 2 * 60 * 1000; // 2 minutos en milisegundos

    async function fetchCountryConfig() {
      try {
        const stored = localStorage.getItem("currency");
        if (stored) {
          const data = JSON.parse(stored) as {
            currency: Currency;
            currencySymbol: string;
            cachedAt: number;
            countryCode: string;
          };

          // Si el cache no ha expirado, úsalo
          if (Date.now() - data.cachedAt < TTL) {
            setCurrency(data.currency);
            setCurrencySymbol(data.currencySymbol);
            setCountryCode(data.countryCode);
            return;
          }
        }

        // Cache expirado o no existe, volver a fetch
        const res = await fetch("https://ipapi.co/json/");
        const { country_code: fetchedCountryCode } = await res.json();
        const cfg = countries[fetchedCountryCode];
        if (cfg) {
          setCurrency(cfg.currency);
          setCurrencySymbol(cfg.currencySymbol);
          setCountryCode(fetchedCountryCode);

          // Guardar con timestamp
          localStorage.setItem(
            "currency",
            JSON.stringify({ 
              currency: cfg.currency, 
              currencySymbol: cfg.currencySymbol,
              countryCode: fetchedCountryCode,
              cachedAt: Date.now() 
            })
          );
        }
      } catch (error) {
        console.error("Error obteniendo configuración de país:", error);
      }
    }

    fetchCountryConfig();
  }, []);

  useEffect(() => {
    // Si selecciona el tracker pero el sensor no está disponible, selecciona el primero
    if (
      !selectedSensor.available?.includes(selectedTrackerType.id) &&
      selectedTrackerType.id !== "none"
    ) {
      setSelectedSensor(sensorsT[0]);
    }
  }, [selectedTrackerType, selectedSensor.available, sensorsT]);

  useEffect(() => {
    setSelectedSensor(sensorsT[0]);
    setSelectedTrackerType(trackersT[0]);
    setSelectedColorTapa(colorsT[0]);
    setSelectedColorCase(colorsT[0]);
  }, [sensorsT, trackersT, colorsT]);

  // Precios desde el backend a través del hook
  const totalPrice = pricing?.prices.totalLocal.toString() || "0";
  const shippingPrice = pricing?.prices.shippingLocal.toString() || "0";
  const exchangeRate = pricing?.currency.exchangeRate || 1;

  // Validación adicional para asegurar que los precios sean válidos y no sean cero
  const isPricingValidAndNonZero = isPricingValid && parseFloat(totalPrice) > 0;

  return (
    <section className="py-4 px-4 bg-white text-black">
      <div className="bg-gray-100 p-4 rounded-lg shadow-lg max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-semibold">
          {t.buildYourTrackers}
        </h1>
        <h3 className="text-sm font-semibold">{t.precisionWithTrackers}</h3>
        <br />
        {/* <SensorSelector
          sensors={sensorsT.filter(
            (sensor) =>
              sensor.available?.includes(selectedTrackerType.id) ?? false
          )}
          selectedSensor={selectedSensor}
          setSelectedSensor={setSelectedSensor}
        /> */}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center items-center">
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
            colors={colorsT}
            selectedColorTapa={selectedColorTapa}
            selectedColorCase={selectedColorCase}
            onColorTapaChange={setSelectedColorTapa}
            onColorCaseChange={setSelectedColorCase}
          />
        </div>
        <br />
        <hr />

        <PricingSummary
          totalPrice={totalPrice}
          shippingPrice={shippingPrice}
          currency={currency}
          currencySymbol={currencySymbol}
          exchangeRate={exchangeRate}
          isLoading={pricingLoading}
          isValid={Boolean(isPricingValidAndNonZero)}
        />

        <h3 className="p-5 text-sm font-semibold">{t.buildTime}</h3>
        <h3 className="p-3 text-sm font-semibold">{t.includes}</h3>
        <h3 className="p-3 text-sm font-semibold">
          {t.partialPayment}
          {isPricingValidAndNonZero ? (
            currencySymbol +
            formatPrice((parseFloat(totalPrice) / 4).toString()) +
            " " +
            currency
          ) : (
            "..."
          )}
          , {t.continuePayment}.
        </h3>
        <button
          className={`mx-auto hover:underline font-bold rounded-full mt-4 py-4 px-8 shadow focus:outline-none focus:shadow-outline transform transition duration-300 ease-in-out flex items-center justify-center gap-2 ${
            isPricingValidAndNonZero 
              ? 'bg-green-500 hover:bg-green-600 text-white opacity-100 hover:scale-105' 
              : 'bg-gray-400 text-gray-600 opacity-50 cursor-not-allowed'
          }`}
          onClick={() => {
            if (!isPricingValidAndNonZero) return;
            
            const message = encodeURIComponent(
              `Hola, quiero encargar estos trackers.
- País: ${currency}
- Tipo de tracker: ${selectedTrackerType.label}
- Sensor: ${selectedSensor.label} 
- Cantidad: ${selectedQuantity}
- Color de la tapa: ${selectedColorTapa.label}
- Color del case: ${selectedColorCase.label}
- Precio total: $${pricing?.prices.totalUsd || 0} USD`
            );

            window.open(`https://wa.me/56975746099?text=${message}`, "_blank");
          }}
          disabled={!isPricingValidAndNonZero}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            className="inline-block"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.384"/>
          </svg>
          {t.askNow}
        </button>

        {/* Contact Form Button */}
        <div className="mt-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="mx-auto hover:underline font-bold rounded-full py-4 px-8 shadow focus:outline-none focus:shadow-outline transform transition duration-300 ease-in-out flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white opacity-100 hover:scale-105"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="inline-block">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
            {t.contactFormButton}
          </button>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsModalOpen(false);
              }
            }}
          >
            <div 
              className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200"
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">
                  {t.contactFormTitle}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Cerrar modal"
                  title="Cerrar modal (Esc)"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hover:text-gray-700">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-6 text-center">
                  {t.contactFormDesc}
                </p>
                
                <form 
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!email || !message) return;
                    
                    setIsSubmitting(true);
                    setSubmitStatus("idle");
                    
                    try {
                      // Ejecutar reCAPTCHA
                      const recaptchaToken = await executeRecaptcha('contact_form');
                      
                      if (!recaptchaToken) {
                        throw new Error('Error en la verificación de seguridad. Por favor, recarga la página e intenta de nuevo.');
                      }

                      const response = await fetch('/api/contact', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          email,
                          message,
                          recaptchaToken
                        })
                      });

                      const data = await response.json();

                      if (!response.ok) {
                        throw new Error(data.error || 'Error al enviar el mensaje');
                      }
                      
                      setSubmitStatus("success");
                      setEmail("");
                      setMessage("");
                      
                      // Reset success message after 3 seconds and close modal
                      setTimeout(() => {
                        setSubmitStatus("idle");
                        setIsModalOpen(false);
                      }, 2000);
                    } catch (error) {
                      console.error('Error sending contact form:', error);
                      setSubmitStatus("error");
                      setTimeout(() => setSubmitStatus("idle"), 3000);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  
                  <div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t.messagePlaceholder}
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || !email || !message}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      isSubmitting || !email || !message
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 transform'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                        {t.sendMessage}
                      </>
                    )}
                  </button>
                  
                  {/* reCAPTCHA Notice */}
                  <div className="text-xs text-gray-500 text-center mt-2 flex items-center justify-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
                      <path d="M12 2L4.09 6.31l1.42 1.42L12 4.13l6.49 3.6 1.42-1.42L12 2zM12 6L4.09 10.31l1.42 1.42L12 8.13l6.49 3.6 1.42-1.42L12 6zM12 10L4.09 14.31l1.42 1.42L12 12.13l6.49 3.6 1.42-1.42L12 10zM3 16l9 5 9-5-1.42-1.42L12 18.13l-7.58-3.55L3 16z"/>
                    </svg>
                    Protegido por reCAPTCHA
                  </div>
                  
                  {/* Status Messages */}
                  {submitStatus === "success" && (
                    <div className="text-center p-3 bg-green-100 text-green-700 rounded-lg border border-green-200">
                      <div className="flex items-center justify-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {t.messageSent}
                      </div>
                    </div>
                  )}
                  
                  {submitStatus === "error" && (
                    <div className="text-center p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
                      <div className="flex items-center justify-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                        {t.messageError}
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        <br />
        {(() => {
          if (pricingLoading) {
            return (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Calculando precios...</span>
              </div>
            );
          }
          
          if (pricingError) {
            return (
              <div className="text-red-600 text-center py-4">
                Error al calcular precios. Por favor, recarga la página.
              </div>
            );
          }
          
          if (!isPricingValidAndNonZero) {
            return null;
          }
          
          const advanceAmount = Math.round(parseFloat(totalPrice) / 4);
          const advanceAmountUsd = Math.round((pricing?.prices.totalUsd || 0) / 4 * 100) / 100;
          
          return (
            <div>
              <div className="relative">
                <div className={`transition-all duration-500 ${acceptedTerms ? 'transform scale-105' : 'transform scale-100'}`}>
                  {currency === "CLP" ? (
                    <FlowPayment
                      amount={advanceAmount}
                      description={`MadTrackers - ${selectedTrackerType.label} x${selectedQuantity}`}
                    />
                  ) : (
                    <PaypalButton 
                      amount={advanceAmountUsd}
                      description={`MadTrackers - ${selectedTrackerType.label} x${selectedQuantity}`}
                    />
                  )}
                </div>
                
                {/* Glass overlay with reflection effect */}
                <div 
                  className={`absolute inset-0 pointer-events-none transition-all duration-1000 ease-out ${
                    acceptedTerms 
                      ? 'opacity-0 scale-110 rotate-3' 
                      : 'opacity-100 scale-100 rotate-0'
                  }`}
                  style={{
                    background: `linear-gradient(
                      135deg, 
                      rgba(255, 255, 255, 0.9) 0%, 
                      rgba(255, 255, 255, 0.6) 15%, 
                      rgba(255, 255, 255, 0.2) 30%, 
                      rgba(255, 255, 255, 0.1) 50%, 
                      rgba(255, 255, 255, 0.3) 70%, 
                      rgba(255, 255, 255, 0.7) 85%, 
                      rgba(255, 255, 255, 0.95) 100%
                    )`,
                    backdropFilter: 'blur(3px) saturate(1.2)',
                    borderRadius: '12px',
                    boxShadow: acceptedTerms 
                      ? 'none' 
                      : `
                        inset 0 2px 4px rgba(255, 255, 255, 0.9),
                        inset 0 -2px 4px rgba(255, 255, 255, 0.5),
                        0 8px 32px rgba(0, 0, 0, 0.15),
                        0 0 0 1px rgba(255, 255, 255, 0.3)
                      `
                  }}
                />
                
                {/* Primary moving reflection */}
                <div 
                  className={`absolute inset-0 pointer-events-none transition-all duration-1200 delay-100 ease-out ${
                    acceptedTerms 
                      ? 'opacity-0 translate-x-full scale-110' 
                      : 'opacity-75 translate-x-0 scale-100'
                  }`}
                  style={{
                    background: `linear-gradient(
                      75deg, 
                      transparent 0%, 
                      transparent 25%,
                      rgba(255, 255, 255, 0.2) 40%, 
                      rgba(255, 255, 255, 0.7) 48%, 
                      rgba(255, 255, 255, 0.9) 50%, 
                      rgba(255, 255, 255, 0.7) 52%, 
                      rgba(255, 255, 255, 0.2) 60%, 
                      transparent 75%,
                      transparent 100%
                    )`,
                    width: '50%',
                    height: '100%',
                    top: '0%',
                    left: acceptedTerms ? '100%' : '-50%',
                    transform: `skewX(-15deg) ${acceptedTerms ? 'translateX(50%)' : 'translateX(0)'}`,
                    borderRadius: '12px',
                    animation: acceptedTerms ? 'none' : 'shimmer 4s ease-in-out infinite',
                  }}
                />

                {/* Secondary diagonal reflection */}
                <div 
                  className={`absolute inset-0 pointer-events-none transition-all duration-800 delay-300 ease-out ${
                    acceptedTerms 
                      ? 'opacity-0 translate-x-full rotate-12' 
                      : 'opacity-70 translate-x-0 rotate-0'
                  }`}
                  style={{
                    background: `linear-gradient(
                      135deg, 
                      transparent 0%, 
                      transparent 20%,
                      rgba(255, 255, 255, 0.3) 35%, 
                      rgba(255, 255, 255, 0.8) 50%, 
                      rgba(255, 255, 255, 0.3) 65%, 
                      transparent 80%,
                      transparent 100%
                    )`,
                    width: '80%',
                    height: '100%',
                    top: '0%',
                    right: acceptedTerms ? '-80%' : '20%',
                    transform: `skewX(-20deg) ${acceptedTerms ? 'translateX(100%)' : 'translateX(0)'}`,
                    borderRadius: '12px',
                  }}
                />

                {/* Disabled state overlay */}
                {!acceptedTerms && (
                  <div 
                    className="absolute inset-0 bg-gray-300 bg-opacity-40 backdrop-blur-sm rounded-lg pointer-events-auto cursor-not-allowed flex items-center justify-center"
                  >
                    <div className="bg-white bg-opacity-95 px-6 py-3 rounded-full shadow-xl border-2 border-gray-200">
                      <p className="text-gray-700 text-sm font-semibold flex items-center gap-2">
                        <span className="text-blue-500 text-lg">🔒</span>{" "}
                        Acepta los términos para continuar con tu compra
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Terms and Conditions Checkbox */}
              <div className="mt-6 mb-4">
                <label className="flex items-center justify-center gap-2 text-sm text-gray-700 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200 transform group-hover:scale-110"
                    />
                    {acceptedTerms && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <svg 
                          className="w-3 h-3 text-white animate-bounce" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="group-hover:text-blue-600 transition-colors duration-200">
                    {t.agreeToTerms}{" "}
                    <a 
                      href="/posts/terminos_y_condiciones" 
                      target="_blank"
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      {t.termsAndConditions}
                    </a>
                  </span>
                </label>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
};

export default Pricing;
