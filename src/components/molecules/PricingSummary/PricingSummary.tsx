import React, { useMemo } from "react";

export interface PricingSummaryProps {
  /** Precio total en moneda local (sin símbolo ni formato). */
  totalPrice: string;
  /** Costo de envío en moneda local (sin símbolo ni formato). */
  shippingPrice: string;
  /** Código ISO de la moneda (ej. "USD", "CLP"). */
  currency: string;
  /** Símbolo de la moneda (ej. "US$", "$"). */
  currencySymbol: string;
  /** Tasa de conversión de 1 USD a moneda local. */
  exchangeRate: number;
  /** Textos de traducción */
  translations?: {
    total: string;
    shipping: string;
    usdEquivalent: string;
  };
  className?: string;
}

/**
 * Formatea un string numérico a formato de miles local según "es-ES".
 */
const formatPrice = (price: string): string =>
  new Intl.NumberFormat("es-ES").format(Number(price));

/**
 * Formatea un número a formato de moneda USD en locale "en-US".
 */
const formatUsd = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

/**
 * Muestra un resumen de precios:
 * - Precio total
 * - Costo de envío
 * - Equivalente en USD (solo si la moneda local no es USD)
 */
const PricingSummary: React.FC<PricingSummaryProps> = React.memo(({
  totalPrice,
  shippingPrice,
  currency,
  currencySymbol,
  exchangeRate,
  translations = {
    total: "Total",
    shipping: "Shipping",
    usdEquivalent: "USD Equivalent"
  },
  className = ""
}) => {
  const { totalLocal, shippingLocal, showUsdEquivalent } = useMemo(() => ({
    totalLocal: Number(totalPrice),
    shippingLocal: Number(shippingPrice),
    showUsdEquivalent: currency !== "USD"
  }), [totalPrice, shippingPrice, currency]);

  const { totalUsd, shippingUsd } = useMemo(() => ({
    totalUsd: showUsdEquivalent ? totalLocal / exchangeRate : undefined,
    shippingUsd: showUsdEquivalent ? shippingLocal / exchangeRate : undefined
  }), [showUsdEquivalent, totalLocal, shippingLocal, exchangeRate]);

  const formattedTotalPrice = useMemo(() => formatPrice(totalPrice), [totalPrice]);
  const formattedShippingPrice = useMemo(() => formatPrice(shippingPrice), [shippingPrice]);
  const formattedUsdTotal = useMemo(() => 
    totalUsd && shippingUsd ? formatUsd(totalUsd + shippingUsd) : undefined,
    [totalUsd, shippingUsd]
  );

  return (
    <div className={`text-center mt-6 ${className}`}>
      <h2 className="text-xl font-semibold">
        {translations.total}: {currencySymbol}
        {formattedTotalPrice} {currency}
      </h2>
      <p className="text-center text-gray-600">
        {translations.shipping}: {currencySymbol}
        {formattedShippingPrice} {currency}
      </p>
      {showUsdEquivalent && formattedUsdTotal && (
        <div className="mt-2">
          <p className="text-center text-gray-500">
            {translations.usdEquivalent}:{" "}
            {formattedUsdTotal}
          </p>
        </div>
      )}
    </div>
  );
});

PricingSummary.displayName = 'PricingSummary';

export { PricingSummary };
