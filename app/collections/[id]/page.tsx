import { redirect } from "next/navigation";

// See app/collections/page.tsx
export default function CollectionPage() {
  redirect("/saved");
}
