import { HeroPost } from "@/app/_components/common/hero-post";
import { getAllPosts } from "@/lib/api";
import WaveDivider from "./_components/common/wave-divider";
import DeferredComponent from "./_components/common/DeferredLoading";
import dynamic from "next/dynamic";

// Lazy load del componente de pricing que no es crítico para First Paint
const Pricing = dynamic(() => import("./_components/pricing/pricing"), {
  ssr: true, // Mantener SSR pero hacer lazy loading en cliente
  loading: () => (
    <div className="loading-skeleton h-96 mx-auto max-w-6xl rounded-lg"></div>
  ),
});

export default function Index() {
  const allPosts = getAllPosts();
  const heroPost = allPosts[0];

  return (
    <main>
      {/* Contenido crítico above-the-fold */}
      <HeroPost title={heroPost.title} subtitle={heroPost.subtitle} />
      
      {/* Contenido no crítico con carga diferida */}
      <WaveDivider />
      <DeferredComponent
        fallback={
          <div className="loading-skeleton h-96 mx-auto max-w-6xl rounded-lg mb-12"></div>
        }
        threshold={0.2}
      >
        <Pricing />
      </DeferredComponent>
    </main>
  );
}
