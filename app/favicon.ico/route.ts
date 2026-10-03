import profile from "@/public/profile.png";

export const dynamic = "force-static";

// A temporary redirect lets later deployments change the content-hashed URL.
export function GET() {
  return new Response(null, {
    status: 307,
    headers: { Location: profile.src, "Cache-Control": "public, max-age=3600" },
  });
}
