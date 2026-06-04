import { NextRequest, NextResponse } from "next/server";
import { getIndonesianHolidays } from "@/lib/holidays";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const year = yearParam ? parseInt(yearParam, 10) : undefined;

    const holidays = await getIndonesianHolidays(year);

    return NextResponse.json({
      success: true,
      data: holidays,
    });
  } catch (error: any) {
    console.error("Fetch holidays API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch holidays",
      },
      { status: 500 }
    );
  }
}
