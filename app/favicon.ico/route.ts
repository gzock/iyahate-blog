import { NextResponse } from "next/server";

// Serve the existing profile image as favicon to satisfy /favicon.ico requests.
export function GET(request: Request) {
  const url = new URL("/profile.png", request.url);
  return NextResponse.redirect(url, 308);
}
