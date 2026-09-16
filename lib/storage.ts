import "server-only";
import { get } from "@vercel/blob";
import type { Snapshot } from "./reporting";
export async function readSnapshot(): Promise<Snapshot | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  const result = await get("kdp/master.json", { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return null;
  return JSON.parse(await new Response(result.stream).text()) as Snapshot;
}
