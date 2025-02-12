import Container from "@/app/_components/container";
import { HeroPost } from "@/app/_components/hero-post";
import { MoreStories } from "@/app/_components/more-stories";
import { getAllPosts } from "@/lib/api";
import WaveDivider from "./_components/wave-divider";
import Pricing from "./_components/pricing";

export default function Index() {
  const allPosts = getAllPosts();

  const heroPost = allPosts[0];

  const morePosts = allPosts.slice(1);

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
      <Container>
        {morePosts.length > 0 && <MoreStories posts={morePosts} />}
      </Container>
    </main>
  );
}
