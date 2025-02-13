import Link from "next/link";
import CoverImage from "../common/cover-image";

type Props = {
  title: string;
  coverImage: string;
  excerpt: string;
  slug: string;
};

export function PostPreview({
  title,
  coverImage,
  excerpt,
  slug,
}: Readonly<Props>) {
  return (
    <div>
      <div className="mb-5">
        <CoverImage slug={slug} title={title} src={coverImage} />
      </div>
      <h3 className="text-3xl mb-3 leading-snug">
        <Link href={`/posts/${slug}`} className="hover:underline">
          {title}
        </Link>
      </h3>
      <p className="text-lg leading-relaxed mb-4">{excerpt}</p>
    </div>
  );
}
