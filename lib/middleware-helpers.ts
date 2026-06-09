import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "./auth";
import { getEffectiveRole } from "./auth";
import { ApiResponse, JWTPayload } from "@/types";

/**
 * Extract and verify the auth token from cookies
 * Returns the user payload if valid, null otherwise
 */
export async function getAuthUser(
  request: Request
): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("rbeas_token")?.value;

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    return payload;
  } catch {
    return null;
  }
}

/**
 * Require authentication - returns user if authenticated,
 * or returns an error response if not
 */
export async function requireAuth(
  request: Request
): Promise<JWTPayload | NextResponse<ApiResponse<never>>> {
  const user = await getAuthUser(request);

  if (!user) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: "Authentication required",
      },
      { status: 401 }
    );
  }

  return user;
}

/**
 * Require admin role - returns user if authenticated and admin,
 * or returns an error response if not
 */
export async function requireAdmin(
  request: Request
): Promise<JWTPayload | NextResponse<ApiResponse<never>>> {
  const user = await getAuthUser(request);

  if (!user) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: "Authentication required",
      },
      { status: 401 }
    );
  }

  const effectiveRole = getEffectiveRole(user.role, user.departmentName);

  if (effectiveRole !== "admin") {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: "Admin access required",
      },
      { status: 403 }
    );
  }

  return user;
}

/**
 * Require admin or finance role - returns user if authenticated
 * and either full admin or finance role
 */
export async function requireAdminOrFinance(
  request: Request
): Promise<JWTPayload | NextResponse<ApiResponse<never>>> {
  const user = await getAuthUser(request);

  if (!user) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: "Authentication required",
      },
      { status: 401 }
    );
  }

  const effectiveRole = getEffectiveRole(user.role, user.departmentName);

  if (effectiveRole !== "admin" && effectiveRole !== "finance") {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: "Admin or Finance access required",
      },
      { status: 403 }
    );
  }

  return user;
}

