import { NextResponse } from 'next/server';

export async function GET() {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const testUrl = `${apiUrl}/bots/did:plc:thdk2bvranllhicun5osfjin`;

  let fetchResult: string;
  try {
    const res = await fetch(testUrl);
    const body = await res.text();
    fetchResult = `status=${res.status} body=${body.substring(0, 200)}`;
  } catch (e) {
    fetchResult = `error: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json({
    API_URL: process.env.API_URL ?? '(unset)',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? '(unset)',
    resolved: apiUrl,
    testUrl,
    fetchResult,
  });
}
