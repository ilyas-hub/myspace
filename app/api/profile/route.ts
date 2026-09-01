import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connect";
import { Profile } from "@/lib/db/models";
import { PRESET_BY_ID } from "@/lib/themes";
import { requireAdmin } from "@/lib/admin-guard";
import {
  validateUsername,
  USERNAME_ERROR_MESSAGE,
} from "@/lib/username";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  await dbConnect();

  const profile = await Profile.findOne().lean();
  return NextResponse.json(profile ?? null);
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  await dbConnect();

  const body = await request.json();
  const { username, displayName, bio, avatarUrl, themeId, socials } = body;

  const usernameError = validateUsername(
    typeof username === "string" ? username : "",
  );
  if (usernameError) {
    return NextResponse.json(
      { error: USERNAME_ERROR_MESSAGE[usernameError] },
      { status: 400 },
    );
  }

  if (themeId && !PRESET_BY_ID[themeId]) {
    return NextResponse.json(
      { error: `Invalid themeId: ${themeId}` },
      { status: 400 },
    );
  }

  const existing = await Profile.findOne({ username }).lean();
  if (existing) {
    return NextResponse.json(
      { error: "Username already taken" },
      { status: 409 },
    );
  }

  const profile = await Profile.create({
    username,
    displayName,
    bio,
    avatarUrl,
    themeId,
    socials,
  });

  return NextResponse.json(profile, { status: 201 });
}

export async function PATCH(request: NextRequest) {
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

  if (updates.themeId && !PRESET_BY_ID[updates.themeId]) {
    return NextResponse.json(
      { error: `Invalid themeId: ${updates.themeId}` },
      { status: 400 },
    );
  }

  if (typeof updates.username === "string") {
    const usernameError = validateUsername(updates.username);
    if (usernameError) {
      return NextResponse.json(
        { error: USERNAME_ERROR_MESSAGE[usernameError] },
        { status: 400 },
      );
    }
  }

  if (updates.username) {
    const existing = await Profile.findOne({
      username: updates.username,
      _id: { $ne: id },
    }).lean();
    if (existing) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 },
      );
    }
  }

  const profile = await Profile.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).lean();

  if (!profile) {
    return NextResponse.json(
      { error: "Profile not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(profile);
}
