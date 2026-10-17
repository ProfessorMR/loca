import { redirect } from "next/navigation";

// Collections were demo data that did not match the real places. Until real
// collections exist, send visitors to their saved places.
export default function CollectionsPage() {
  redirect("/saved");
}
