import { checkDbConnection } from "@/app/actions";
import { NextResponse } from "next/server";

export type CheckDbConnectionResponse = {
  isConnected: boolean;
};

export async function POST(): Promise<NextResponse<CheckDbConnectionResponse>> {
  try {
    const isConnected = await checkDbConnection();
    return NextResponse.json({ isConnected });
  } catch (error) {
    console.error("Database connection check failed:", error);
    return NextResponse.json({ isConnected: false });
  }
}