import React from "react";
import { Currency } from "../../types";

type PricingSummaryProps = {
  totalPrice: string;
  shippingPrice: string;
  currency: Currency;
  currencySymbol: string;
};

const formatPrice = (price: string) => {
  return new Intl.NumberFormat("es-ES").format(Number(price));
};

const PricingSummary: React.FC<PricingSummaryProps> = ({
  totalPrice,
  shippingPrice,
  currency,
  currencySymbol,
}) => {
  return (
    <div className="text-center mt-6">
      <h2 className="text-xl font-semibold">
        Precio Total: {currencySymbol}
        {formatPrice(totalPrice)} {currency}
      </h2>
      <p className="text-gray-600 text-center">
        Envío desde: {currencySymbol}
        {formatPrice(shippingPrice)} {currency}
      </p>
    </div>
  );
};

export default PricingSummary;
