"use client";

import { useLang } from "@/app/lang-context";
import Container from "@/app/_components/common/container";
import { PostBody } from "@/app/_components/post/post-body";
import WaveDivider from "@/app/_components/common/wave-divider";
import { Post } from "@/interfaces/post";

type PostClientWrapperProps = {
  post: Post;
  esContent: string;
  enContent: string;
};

export default function PostClientWrapper({ post, esContent, enContent }: PostClientWrapperProps) {
  const { lang } = useLang();
  
  const currentContent = lang === 'es' ? post.es : post.en;
  const htmlContent = lang === 'es' ? esContent : enContent;

  return (
    <main>
      <section>
        <div className="pt-8">
          <div className="container px-3 mx-auto flex flex-wrap flex-col md:flex-row items-center">
            <div className="flex flex-col w-full justify-center items-start text-center md:text-left">
              <h1 className="my-4 text-5xl font-bold leading-tight py-8 pb-16">
                {currentContent.title}
              </h1>
            </div>
          </div>
        </div>
      </section>
      <WaveDivider />
      <Container>
        <article className="mb-32">
          <PostBody content={htmlContent} />
        </article>
      </Container>
    </main>
  );
}
