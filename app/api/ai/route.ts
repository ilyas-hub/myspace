import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import {
  generateBio,
  generateLinkCaptions,
  normalizeKeywords,
  normalizeLinks,
} from "@/lib/ai/generator";

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const mode = body.mode;

  if (mode === "bio") {
    const keywords = normalizeKeywords(body.keywords);
    if (keywords.length === 0) {
      return NextResponse.json(
        { error: "Provide at least one keyword to generate a bio." },
        { status: 400 },
      );
    }
    try {
      const bio = await generateBio(keywords);
      return NextResponse.json({ bio });
    } catch (err) {
      console.error("[api/ai] bio generation error:", err);
      return NextResponse.json(
        { error: "AI generation failed. Try again." },
        { status: 502 },
      );
    }
  }

  if (mode === "links") {
    const links = normalizeLinks(body.links);
    if (links.length === 0) {
      return NextResponse.json(
        { error: "Provide at least one link to generate captions." },
        { status: 400 },
      );
    }
    try {
      const captions = await generateLinkCaptions(links);
      return NextResponse.json({ captions });
    } catch (err) {
      console.error("[api/ai] link captions generation error:", err);
      return NextResponse.json(
        { error: "AI generation failed. Try again." },
        { status: 502 },
      );
    }
  }

  return NextResponse.json(
    { error: `Unsupported mode: ${String(mode)}` },
    { status: 400 },
  );
}
