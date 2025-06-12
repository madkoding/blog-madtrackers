import { getAllPosts } from "@/lib/api";
import ClientHomeWrapper from "./_components/ClientHomeWrapper";

export default function Index() {
  const allPosts = getAllPosts();

  return <ClientHomeWrapper allPosts={allPosts} />;
}
