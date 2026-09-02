import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "kunststofgevel-website",
    time: new Date().toISOString(),
  });
}
