import CoverImage from "@/app/_components/cover-image";
import Link from "next/link";

type Props = {
  title: string;
  coverImage: string;
  excerpt: string;
  slug: string;
};

export function HeroPost({
  title,
  coverImage,
  excerpt,
  slug,
}: Readonly<Props>) {
  return (
    <section>
      <div className="mb-8 md:mb-16">
        {/* Ajustar el grid para pantallas grandes */}
        <div className="md:grid md:grid-cols-2 md:gap-x-16 lg:gap-x-8 items-center">
          {/* Imagen al lado izquierdo */}
          <div className="mb-8 md:mb-0">
            <CoverImage title={title} src={coverImage} slug={slug} />
          </div>

          {/* Texto al lado derecho */}
          <div>
            <h3 className="mb-4 text-4xl lg:text-5xl leading-tight">
              <Link href={`/posts/${slug}`} className="hover:underline">
                {title}
              </Link>
            </h3>
            <p className="text-lg leading-relaxed">{excerpt}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
