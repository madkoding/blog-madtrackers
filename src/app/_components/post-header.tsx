import CoverImage from "./cover-image";
import { PostTitle } from "@/app/_components/post-title";

type Props = {
  title: string;
  coverImage: string;
};

export function PostHeader({ title, coverImage }: Readonly<Props>) {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start mb-8 md:mb-16 sm:mx-0">
      {/* Imagen a la izquierda, más pequeña */}
      <div className="flex-shrink-0 mb-4 md:mb-0 md:w-1/4">
        <CoverImage title={title} src={coverImage} />
      </div>

      {/* Título a la derecha con padding izquierdo */}
      <div className="md:w-3/4 text-center md:text-left pl-4">
        <PostTitle>{title}</PostTitle>
      </div>
    </div>
  );
}
