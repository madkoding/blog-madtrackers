import Container from "../_components/common/container";
import WaveDivider from "../_components/common/wave-divider";
import Faq from "../_components/faq";

/**
 * Página principal que integra el componente FAQ.
 */
export default function Home() {
  return (
    <main>
      <section>
        <div className="pt-4">
          <div className="container px-3 mx-auto flex flex-wrap flex-col md:flex-row items-center">
            <div className="flex flex-col w-full md:w-2/5 justify-center items-start text-center md:text-left">
              <h1 className="my-4 text-5xl font-bold leading-tight py-16">
                Bienvenido al FAQ con Inteligencia Artificial
              </h1>
            </div>
          </div>
        </div>
      </section>
      <WaveDivider />
      <Container>
        <article className="mb-64">
          <Faq />
        </article>
      </Container>
    </main>
  );
}
