import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connect";
import { Click, Link } from "@/lib/db/models";

export async function POST(request: NextRequest) {
  await dbConnect();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { linkId } = body;

  if (typeof linkId !== "string" || !linkId) {
    return NextResponse.json(
      { error: "linkId is required" },
      { status: 400 },
    );
  }

  const link = await Link.findById(linkId).lean();
  if (!link) {
    return NextResponse.json(
      { error: "Link not found" },
      { status: 404 },
    );
  }

  await Click.create({
    profileId: link.profileId,
    linkId: link._id,
    timestamp: new Date(),
  });
  await Link.findByIdAndUpdate(linkId, { $inc: { clickCount: 1 } });

  return NextResponse.json({ ok: true });
}