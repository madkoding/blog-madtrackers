import { Post } from "@/interfaces/post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

const postsDirectory = join(process.cwd(), "_posts");

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  // Procesar el contenido bilingüe
  // Buscar separador entre idiomas (---LANG-SEPARATOR---)
  const langSeparator = "---LANG-SEPARATOR---";
  const contentParts = content.split(langSeparator);
  
  let esContent = content;
  let enContent = content;
  
  if (contentParts.length === 2) {
    esContent = contentParts[0].trim();
    enContent = contentParts[1].trim();
  }

  return {
    slug: realSlug,
    date: data.date,
    coverImage: data.coverImage,
    author: data.author,
    ogImage: data.ogImage,
    preview: data.preview,
    es: {
      title: data.title?.es || data.title || "",
      subtitle: data.subtitle?.es || data.subtitle || "",
      excerpt: data.excerpt?.es || data.excerpt || "",
      content: esContent
    },
    en: {
      title: data.title?.en || data.title || "",
      subtitle: data.subtitle?.en || data.subtitle || "",
      excerpt: data.excerpt?.en || data.excerpt || "",
      content: enContent
    }
  } as Post;
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}
