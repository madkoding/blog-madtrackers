import React, { useMemo } from "react";
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
  /** Indica si los precios están cargando. */
  isLoading?: boolean;
  /** Indica si los precios son válidos. */
  isValid?: boolean;
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
const PricingSummary: React.FC<PricingSummaryProps> = React.memo(({
  totalPrice,
  shippingPrice,
  currency,
  currencySymbol,
  exchangeRate,
  isLoading = false,
  isValid = true,
}) => {
  const { lang } = useLang();
  const t = translations[lang];

  // Calcular valores solo si tenemos datos válidos
  const { totalLocal, shippingLocal, showUsdEquivalent } = useMemo(() => ({
    totalLocal: Number(totalPrice) || 0,
    shippingLocal: Number(shippingPrice) || 0,
    showUsdEquivalent: currency !== "USD"
  }), [totalPrice, shippingPrice, currency]);

  const { totalUsd, shippingUsd } = useMemo(() => ({
    totalUsd: showUsdEquivalent ? totalLocal / exchangeRate : undefined,
    shippingUsd: showUsdEquivalent ? shippingLocal / exchangeRate : undefined
  }), [showUsdEquivalent, totalLocal, shippingLocal, exchangeRate]);

  const formattedTotalPrice = useMemo(() => formatPrice(totalPrice || "0"), [totalPrice]);
  const formattedShippingPrice = useMemo(() => formatPrice(shippingPrice || "0"), [shippingPrice]);
  const formattedUsdTotal = useMemo(() => 
    totalUsd ? formatUsd(totalUsd) : undefined,
    [totalUsd]
  );
  const formattedUsdShipping = useMemo(() => 
    shippingUsd ? formatUsd(shippingUsd) : undefined,
    [shippingUsd]
  );

  // Si está cargando, mostrar placeholders
  if (isLoading) {
    return (
      <div className="text-center mt-6 animate-pulse">
        <div className="h-6 bg-gray-300 rounded mb-2 w-48 mx-auto"></div>
        <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
      </div>
    );
  }

  // Si no es válido, mostrar mensaje de error o placeholder
  if (!isValid) {
    return (
      <div className="text-center mt-6">
        <h2 className="text-xl font-semibold text-gray-400">
          {t.total}: ---
        </h2>
        <p className="text-center text-gray-400">
          + {t.shipping}: ---
        </p>
      </div>
    );
  }

  return (
    <div className="text-center mt-6">
      <h2 className="text-xl font-semibold">
        {t.total}: {currencySymbol}
        {formattedTotalPrice} {currency}
      </h2>
      <p className="text-center text-gray-600">
        + {t.shipping}: {currencySymbol}
        {formattedShippingPrice} {currency}
      </p>
      {showUsdEquivalent && (
        <div className="mt-2 space-y-1">
          {formattedUsdTotal && (
            <p className="text-center text-gray-500">
              {t.usdEquivalent || "Equivalente en USD"}:{" "}
              {formattedUsdTotal}
            </p>
          )}
          {formattedUsdShipping && (
            <p className="text-center text-gray-500">
              + Shipping USD: {formattedUsdShipping}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

PricingSummary.displayName = 'PricingSummary';

export default PricingSummary;
