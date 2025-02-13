import Container from "@/app/_components/common/container";
import cn from "classnames";

type Props = {
  preview?: boolean;
};

const Alert = ({ preview }: Props) => {
  return (
    <div
      className={cn("border-b", {
        "bg-neutral-800 border-neutral-800 text-black": preview,
        "bg-neutral-50 border-neutral-200 text-black": !preview,
      })}
    >
      <Container>
        <div className="py-2 text-center text-sm">
          {preview ? (
            <>
              This page is a preview.{" "}
              <a
                href="/api/exit-preview"
                className="underline hover:text-teal-300 duration-200 transition-colors"
              >
                Click here
              </a>{" "}
              to exit preview mode.
            </>
          ) : (
            <>
              La fabricación de un SlimeVR toma al rededor de 1 a 2 meses. Se
              debe realizar un abono de 60USD no reembolsable para unirse a la
              cola de producción. Esto le asegurará tener piezas en camino para
              poder fabricar los trackers, configurarlos, y probarlos
              adecuadamente.
            </>
          )}
        </div>
      </Container>
    </div>
  );
};

export default Alert;
