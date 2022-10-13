import * as React from "react";
import { LoaderArgs, MetaFunction, redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";

import { getUser } from "~/models/user.server";

export async function loader({ request }: LoaderArgs) {
  const user = await getUser(request);
  if (!user) return redirect("/");	
  return user;
}

export const meta: MetaFunction = () => {
  return {
    title: "Workspace",
  };
};

export default function Workspace() {
  const user = useLoaderData<typeof loader>();

  return (
    <>
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to="/">Home</Link>
        </h1>
        <p>{user?.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <div className="flex h-full min-h-screen flex-col">
        <p>
          {user?.username} - {user?.email}
        </p>
      </div>
    </>
  );
}
