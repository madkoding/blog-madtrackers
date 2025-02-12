import { HeroPost } from "@/app/_components/hero-post";
import { getAllPosts } from "@/lib/api";
import WaveDivider from "./_components/wave-divider";
import Pricing from "./_components/pricing";

export default function Index() {
  const allPosts = getAllPosts();

  const heroPost = allPosts[0];

  return (
    <main>
      <HeroPost
        title={heroPost.title}
        coverImage={heroPost.coverImage}
        slug={heroPost.slug}
        excerpt={heroPost.excerpt}
      />
      <WaveDivider />
      <Pricing />
    </main>
  );
}
