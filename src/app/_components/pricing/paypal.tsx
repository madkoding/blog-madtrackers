import React from "react";

/**
 * Componente de botón de PayPal.
 *
 * Renderiza el formulario de PayPal con el estilo y contenido original.
 *
 * @returns {JSX.Element} El formulario de PayPal.
 */
export default function PaypalButton(): JSX.Element {
  return (
    <>
      <style jsx>{`
        .pp-6BPXHUKRZPK88 {
          text-align: center;
          border: none;
          border-radius: 1.5rem;
          min-width: 11.625rem;
          padding: 0 2rem;
          height: 3.125rem;
          font-weight: bold;
          background-color: #ffd140;
          color: #000000;
          font-family: "Helvetica Neue", Arial, sans-serif;
          font-size: 1.125rem;
          line-height: 1.5rem;
          cursor: pointer;
        }
      `}</style>
      <form
        action="https://www.paypal.com/ncp/payment/6BPXHUKRZPK88"
        method="post"
        target="_blank"
        style={{
          display: "inline-grid",
          justifyItems: "center",
          alignContent: "start",
          gap: "0.5rem",
        }}
      >
        <input
          className="pp-6BPXHUKRZPK88"
          type="submit"
          value="Abonar ahora!"
        />
        <img
          src="https://www.paypalobjects.com/images/Debit_Credit.svg"
          alt="cards"
        />
        <section>
          Con la tecnología de{" "}
          <img
            src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg"
            alt="paypal"
            style={{ height: "0.875rem", verticalAlign: "middle" }}
          />
        </section>
      </form>
    </>
  );
}
