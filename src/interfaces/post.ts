import { type Author } from "./author";

export type PostContent = {
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
};

export type Post = {
  slug: string;
  date: string;
  coverImage: string;
  author: Author;
  ogImage: {
    url: string;
  };
  preview?: boolean;
  // Contenido en múltiples idiomas
  es: PostContent;
  en: PostContent;
};
