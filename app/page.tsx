import Dashboard from "@/components/dashboard";
import { readSnapshot } from "@/lib/storage";
export const dynamic = "force-dynamic";

export default async function Home() {
  return <Dashboard snapshot={await readSnapshot()} />;
}
