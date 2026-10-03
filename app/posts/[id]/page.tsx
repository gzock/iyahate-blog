import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, summaries } from "@/lib/posts";
import { postMetadata } from "@/lib/metadata";
import PostView from "@/app/post-view";

export const dynamicParams = false;
export function generateStaticParams() {
  return summaries.map(({ id }) => ({ id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost((await params).id);
  if (!post) notFound();
  return postMetadata(post);
}

export default async function PostPage({ params }: Props) {
  const post = getPost((await params).id);
  if (!post) notFound();
  return <PostView post={post} />;
}
