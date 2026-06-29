// filepath: src/app/page.tsx
/**
 * Root redirect to surveillance view.
 */

import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/dashboard");
}
