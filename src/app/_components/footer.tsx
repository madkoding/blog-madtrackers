import Container from "@/app/_components/container";

export function Footer() {
  return (
    <footer className="bg-accent-7 border-t border-accent-1">
      <Container>
        <div className="py-28 flex flex-col lg:flex-row items-center">
          <h3 className="text-4xl lg:text-[2.5rem] font-bold tracking-tighter leading-tight text-center lg:text-left mb-10 lg:mb-0 lg:pr-4 lg:w-1/2 text-accent-1">
            Interesado en adquirir tu SlimeVR madTrackers?
          </h3>
          <div className="flex flex-col lg:flex-row justify-center items-center lg:pl-4 lg:w-1/2">
            <a
              href="mailto:madkoding@gmail.com"
              className="mx-3 bg-accent-1 hover:bg-accent-2 text-accent-7 hover:text-accent-7 border border-accent-7 font-bold py-5 px-16 lg:px-10 text-xl lg:text-2xl duration-200 transition-colors mb-6 lg:mb-0"
            >
              Contactar
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
