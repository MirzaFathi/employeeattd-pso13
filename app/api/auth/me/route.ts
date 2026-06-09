import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getAuthUser } from "@/lib/middleware-helpers";
import { getEffectiveRole } from "@/lib/auth";
import User from "@/models/User";
import Department from "@/models/Department";
import { ApiResponse } from "@/types";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    // Get authenticated user from token
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();
    // Ensure Department model is registered for populate
    void Department;

    // Find user by ID (exclude password)
    const user = await User.findById(authUser.userId).populate("department", "name");

    if (!user) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Compute effective role
    const departmentName = user.department?.name || undefined;
    const effectiveRole = getEffectiveRole(user.role, departmentName);

    // Return user data
    return NextResponse.json<ApiResponse<unknown>>(
      {
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: effectiveRole,
          department: user.department,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
