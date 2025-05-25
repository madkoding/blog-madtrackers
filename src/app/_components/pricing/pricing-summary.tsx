import React from "react";
import { Currency } from "../../types";
import { useLang } from "../../lang-context";
import { translations } from "../../i18n";

/**
 * Props para el componente PricingSummary.
 */
export interface PricingSummaryProps {
  /** Precio total en moneda local (sin símbolo ni formato). */
  totalPrice: string;
  /** Costo de envío en moneda local (sin símbolo ni formato). */
  shippingPrice: string;
  /** Código ISO de la moneda (ej. "USD", "CLP"). */
  currency: Currency;
  /** Símbolo de la moneda (ej. "US$", "$"). */
  currencySymbol: string;
  /** Tasa de conversión de 1 USD a moneda local. */
  exchangeRate: number;
}

/**
 * Formatea un string numérico a formato de miles local según "es-ES".
 *
 * @param price - Valor numérico como string.
 * @returns Precio formateado con separadores de miles.
 */
const formatPrice = (price: string): string =>
  new Intl.NumberFormat("es-ES").format(Number(price));

/**
 * Formatea un número a formato de moneda USD en locale "en-US".
 *
 * @param value - Valor numérico en USD.
 * @returns Precio formateado con símbolo USD.
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
 *
 * @param props - Props de PricingSummary.
 */
const PricingSummary: React.FC<PricingSummaryProps> = ({
  totalPrice,
  shippingPrice,
  currency,
  currencySymbol,
  exchangeRate,
}) => {
  const { lang } = useLang();
  const t = translations[lang];

  const totalLocal = Number(totalPrice);
  const shippingLocal = Number(shippingPrice);
  const showUsdEquivalent = currency !== "USD";

  // Cálculo del equivalente en USD
  const totalUsd = showUsdEquivalent ? totalLocal / exchangeRate : undefined;
  const shippingUsd = showUsdEquivalent
    ? shippingLocal / exchangeRate
    : undefined;

  return (
    <div className="text-center mt-6">
      <h2 className="text-xl font-semibold">
        {t.total}: {currencySymbol}
        {formatPrice(totalPrice)} {currency}
      </h2>
      <p className="text-center text-gray-600">
        {t.shipping}: {currencySymbol}
        {formatPrice(shippingPrice)} {currency}
      </p>
      {showUsdEquivalent && (
        <div className="mt-2">
          <p className="text-center text-gray-500">
            {t.usdEquivalent || "Equivalente en USD"}:{" "}
            {formatUsd(totalUsd! + shippingUsd!)}
          </p>
        </div>
      )}
    </div>
  );
};

export default PricingSummary;
