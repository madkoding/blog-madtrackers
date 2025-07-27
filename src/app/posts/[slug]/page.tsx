import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/api";
import markdownToHtml from "@/lib/markdownToHtml";
import PostClientWrapper from "./PostClientWrapper";

export default async function Post({ params }: Readonly<Params>) {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams.slug);

  if (!post) {
    return notFound();
  }

  // Pre-renderizar contenido en ambos idiomas
  const esContent = await markdownToHtml(post.es.content || "");
  const enContent = await markdownToHtml(post.en.content || "");

  return (
    <PostClientWrapper 
      post={post}
      esContent={esContent}
      enContent={enContent}
    />
  );
}

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams.slug);

  if (!post) {
    return {};
  }

  // Usar el título en español por defecto para metadata
  const title = post.es.title;

  return {
    title,
    openGraph: {
      title,
      images: [post.ogImage.url],
    },
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
