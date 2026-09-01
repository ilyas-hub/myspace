import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connect";
import { Link, Profile } from "@/lib/db/models";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  await dbConnect();

  const { searchParams } = request.nextUrl;
  const profileId = searchParams.get("profileId");

  if (!profileId) {
    return NextResponse.json(
      { error: "profileId is required" },
      { status: 400 },
    );
  }

  const links = await Link.find({ profileId }).sort({ position: 1 }).lean();
  return NextResponse.json(links);
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  await dbConnect();

  const body = await request.json();
  const { profileId, url, label, thumbnailUrl, position, enabled } = body;

  if (!profileId || !url || !label) {
    return NextResponse.json(
      { error: "profileId, url, and label are required" },
      { status: 400 },
    );
  }

  const profile = await Profile.findById(profileId).lean();
  if (!profile) {
    return NextResponse.json(
      { error: "Profile not found" },
      { status: 404 },
    );
  }

  const link = await Link.create({
    profileId,
    url,
    label,
    thumbnailUrl,
    position: position ?? 0,
    enabled: enabled ?? true,
  });

  return NextResponse.json(link, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  await dbConnect();

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json(
      { error: "id is required" },
      { status: 400 },
    );
  }

  const link = await Link.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).lean();

  if (!link) {
    return NextResponse.json(
      { error: "Link not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(link);
}

export async function DELETE(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  await dbConnect();

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json(
      { error: "id is required" },
      { status: 400 },
    );
  }

  const link = await Link.findByIdAndDelete(id).lean();

  if (!link) {
    return NextResponse.json(
      { error: "Link not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
