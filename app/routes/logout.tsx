import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { logout } from "~/service/auth/auth.server";

export async function action({ request }: ActionArgs) {
  return await logout(request);
}

export async function loader() {
  return redirect("/");
}
