import { HeroPost } from "@/app/_components/common/hero-post";
import { getAllPosts } from "@/lib/api";
import WaveDivider from "./_components/common/wave-divider";
import Pricing from "./_components/pricing/pricing";

export default function Index() {
  const allPosts = getAllPosts();

  const heroPost = allPosts[0];

  return (
    <main>
      <HeroPost title={heroPost.title} subtitle={heroPost.subtitle} />
      <WaveDivider />
      <Pricing />
    </main>
  );
}
