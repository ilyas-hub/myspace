import { redirect } from "next/navigation";
import { SEEDED_USERNAME } from "@/lib/public-profile";

export default function Home() {
  redirect(`/${SEEDED_USERNAME}`);
}
