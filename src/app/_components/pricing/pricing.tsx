"use client";

import React from "react";
import { quantities } from "../../constants";
import { translations } from "../../i18n";
import { useLang } from "../../lang-context";
import { usePricing } from "../../../hooks/usePricing";
import { useProductConfiguration } from "../../../hooks/useProductConfiguration";
import { useCountryConfig } from "../../../hooks/useCountryConfig";
import { useContactForm } from "../../../hooks/useContactForm";
import { useTermsAcceptance } from "../../../hooks/useTermsAcceptance";
import { useWhatsAppMessage } from "../../../hooks/useWhatsAppMessage";
import QuantitySelector from "./quantity-selector";
import ColorSelector from "./color-selector";
import PricingSummary from "./pricing-summary";
import ImageWithPoints from "./image-with-points";
import UsbReceiverSelector from "./usb-receiver-selector";
import StrapSelector from "./strap-selector";
import ChargingDockSelector from "./charging-dock-selector";
import ContactFormModal from "./contact-form-modal";
import PaymentSection from "./payment-section";
import WhatsAppButton from "./whatsapp-button";
import ContactButton from "./contact-button";

const Pricing = () => {
  const { lang } = useLang();
  const t = translations[lang];

  // Hooks personalizados para manejo de estado
  const productConfig = useProductConfiguration();
  const countryConfig = useCountryConfig();
  const contactForm = useContactForm();
  const termsAcceptance = useTermsAcceptance();

  // Hook para obtener precios desde el backend
  const { pricing, loading: pricingLoading, error: pricingError } = usePricing({
    sensorId: productConfig.selectedSensor.id,
    trackerId: productConfig.selectedTrackerType.id,
    quantity: productConfig.selectedQuantity,
    countryCode: countryConfig.countryCode,
    usbReceiverId: productConfig.selectedUsbReceiver?.id,
    strapId: productConfig.selectedStrap?.id,
    chargingDockId: productConfig.selectedChargingDock?.id,
  });

  // Debug logging para verificar valores seleccionados
  React.useEffect(() => {
    console.log('🔍 [PRICING COMPONENT] Current product configuration:', {
      sensor: productConfig.selectedSensor,
      tracker: productConfig.selectedTrackerType,
      quantity: productConfig.selectedQuantity,
      colorCase: productConfig.selectedColorCase,
      colorTapa: productConfig.selectedColorTapa,
      country: countryConfig.countryCode
    });
  }, [
    productConfig.selectedSensor,
    productConfig.selectedTrackerType,
    productConfig.selectedQuantity,
    productConfig.selectedColorCase,
    productConfig.selectedColorTapa,
    countryConfig.countryCode
  ]);

  // Hook para mensaje de WhatsApp
  const whatsAppMessage = useWhatsAppMessage({
    selectedTrackerType: productConfig.selectedTrackerType,
    selectedSensor: productConfig.selectedSensor,
    selectedQuantity: productConfig.selectedQuantity,
    selectedColorTapa: productConfig.selectedColorTapa,
    selectedColorCase: productConfig.selectedColorCase,
    selectedUsbReceiver: productConfig.selectedUsbReceiver,
    selectedStrap: productConfig.selectedStrap,
    selectedChargingDock: productConfig.selectedChargingDock,
    currency: countryConfig.currency,
    totalUsd: pricing?.prices.totalUsd || 0,
  });

  // Validar que los precios sean válidos antes de mostrar los botones de pago
  const isPricingValid = pricing && 
    pricing.prices.totalLocal > 0 && 
    pricing.prices.totalUsd > 0 && 
    !pricingLoading && 
    !pricingError;

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center items-center">
          <QuantitySelector
            quantities={quantities}
            selectedQuantity={productConfig.selectedQuantity}
            setSelectedQuantity={productConfig.setSelectedQuantity}
          />
          <ImageWithPoints selectedQuantity={productConfig.selectedQuantity} />
          
          <ColorSelector
            colors={productConfig.colorsT}
            selectedColorTapa={productConfig.selectedColorTapa}
            selectedColorCase={productConfig.selectedColorCase}
            onColorTapaChange={productConfig.setSelectedColorTapa}
            onColorCaseChange={productConfig.setSelectedColorCase}
          />
        </div>
        
        {/* Nuevas opciones de configuración */}
        <div className="mt-8 space-y-6">
          <UsbReceiverSelector
            usbReceivers={productConfig.usbReceiversT}
            selectedUsbReceiver={productConfig.selectedUsbReceiver}
            setSelectedUsbReceiver={productConfig.setSelectedUsbReceiver}
          />
          
          <StrapSelector
            straps={productConfig.strapsT}
            selectedStrap={productConfig.selectedStrap}
            setSelectedStrap={productConfig.setSelectedStrap}
          />
          
          <ChargingDockSelector
            chargingDocks={productConfig.chargingDocksT}
            selectedChargingDock={productConfig.selectedChargingDock}
            setSelectedChargingDock={productConfig.setSelectedChargingDock}
            selectedQuantity={productConfig.selectedQuantity}
          />
        </div>
        <br />
        <hr />

        <PricingSummary
          totalPrice={totalPrice}
          shippingPrice={shippingPrice}
          currency={countryConfig.currency}
          currencySymbol={countryConfig.currencySymbol}
          exchangeRate={exchangeRate}
          isLoading={pricingLoading}
          isValid={Boolean(isPricingValidAndNonZero)}
        />

        <h3 className="p-3 text-sm font-semibold">{t.includes}</h3>

        {/* Mensaje de tiempo de fabricación y entrega */}
        <div style={{
          color: 'orange',
          paddingLeft: '48px',
          paddingRight: '48px',
          borderRadius: '6px',
          marginBottom: '16px',
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '1px 1px 3px black, -1px -1px 3px black, 1px -1px 3px black, -1px 1px 3px black',
          fontSize: '20px',
        }}>
          {t.buildTime}
        </div>

        <WhatsAppButton
          isEnabled={Boolean(isPricingValidAndNonZero)}
          onWhatsAppClick={whatsAppMessage.openWhatsApp}
        />

        {/* <ContactButton
          onContactClick={() => contactForm.setIsModalOpen(true)}
        /> */}

        <ContactFormModal
          isOpen={contactForm.isModalOpen}
          onClose={() => contactForm.setIsModalOpen(false)}
          email={contactForm.email}
          message={contactForm.message}
          isSubmitting={contactForm.isSubmitting}
          submitStatus={contactForm.submitStatus}
          setEmail={contactForm.setEmail}
          setMessage={contactForm.setMessage}
          onSubmit={contactForm.submitForm}
        />

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
          
          return (
            <PaymentSection
              currency={countryConfig.currency}
              totalPrice={totalPrice}
              totalUsd={pricing?.prices.totalUsd || 0}
              selectedTrackerType={productConfig.selectedTrackerType}
              selectedQuantity={productConfig.selectedQuantity}
              acceptedTerms={termsAcceptance.acceptedTerms}
              onTermsChange={termsAcceptance.setAcceptedTerms}
              selectedSensor={productConfig.selectedSensor}
              selectedColorCase={productConfig.selectedColorCase}
              selectedColorTapa={productConfig.selectedColorTapa}
              selectedUsbReceiver={productConfig.selectedUsbReceiver}
              selectedStrap={productConfig.selectedStrap}
              selectedChargingDock={productConfig.selectedChargingDock}
            />
          );
        })()}
      </div>
    </section>
  );
};

export default Pricing;
