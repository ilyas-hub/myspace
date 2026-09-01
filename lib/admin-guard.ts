import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSecret, ADMIN_SECRET_HEADER } from "./admin";

export function requireAdmin(request: NextRequest): NextResponse | null {
  const secret = request.headers.get(ADMIN_SECRET_HEADER);
  if (!verifyAdminSecret(secret)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }
  return null;
}
