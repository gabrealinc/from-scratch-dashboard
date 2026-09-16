import { timingSafeEqual } from "crypto";
import { put } from "@vercel/blob";
import { buildSnapshot, sheetPlan, type RawReport } from "@/lib/reporting";
export const maxDuration = 60;
export async function POST(request: Request) {
  const secret = process.env.SYNC_SECRET;
  const supplied = request.headers.get("authorization") ?? "";
  const expected = secret ? `Bearer ${secret}` : "";
  const suppliedBytes = Buffer.from(supplied);
  const expectedBytes = Buffer.from(expected);
  if (!secret || suppliedBytes.length !== expectedBytes.length || !timingSafeEqual(suppliedBytes,expectedBytes)) return Response.json({error:"Unauthorized"},{status:401});
  const text = await request.text();
  if (text.length > 3500000) return Response.json({error:"Report payload too large; import was not changed."},{status:413});
  try {
    const body = JSON.parse(text) as {phase:"prepare"|"commit";reports:RawReport[];sheetVerified?:boolean};
    const snapshot=buildSnapshot(body.reports);
    const plan=sheetPlan(snapshot);
    if (body.phase === "prepare") return Response.json({snapshot,plan},{headers:{"Cache-Control":"no-store"}});
    if (body.phase !== "commit" || body.sheetVerified !== true) return Response.json({error:"Verified master sheet write required."},{status:400});
    await put("kdp/master.json",JSON.stringify(snapshot),{access:"private",addRandomSuffix:false,allowOverwrite:true,contentType:"application/json",cacheControlMaxAge:60});
    return Response.json({ok:true,copies:snapshot.totals.copies,royalties:snapshot.totals.royalties,syncedAt:snapshot.syncedAt});
  } catch (error) {
    return Response.json({error:error instanceof Error?error.message:"Invalid report"},{status:400});
  }
}
