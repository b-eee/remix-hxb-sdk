import * as React from "react";
import { LoaderArgs, MetaFunction, redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import Select from 'react-tailwindcss-select';
import { getUser } from "~/service/user/user.server";
import { getCurrentWorkspace, getWorkspaces } from "~/service/workspace/workspace.server";
import { UserInfo } from "@hexabase/hexabase-js/dist/lib/types/user";
import { WorkspaceCurrentRes, WorkspacesRes } from "~/respone/workspace";
import { getProject } from "~/service/project/project.server";
import { ApplicationRes } from "~/respone/project";

export async function loader({ request }: LoaderArgs) {
  let projects;
  const user = await getUser(request);
  const workspaces = await getWorkspaces(request);
  const currWs = await getCurrentWorkspace(request);
  if (!currWs?.error && currWs?.wsCurrent?.workspace_id) {
    projects = await getProject(request, currWs?.wsCurrent?.workspace_id);
  }
  if (!user) return redirect("/");
  if (!workspaces) return json([]);
  if (!projects) return json([]);
  return { user, workspaces, projects, currWs };
}

export const meta: MetaFunction = () => {
  return {
    title: "Workspace",
  };
};

const options = [
  { value: "fox", label: "🦊 Fox" },
  { value: "Butterfly", label: "🦋 Butterfly" },
  { value: "Honeybee", label: "🐝 Honeybee" },
];

export default function Workspace() {
  const data: {
    user: UserInfo,
    workspaces: WorkspacesRes,
    projects: ApplicationRes,
    currWs: WorkspaceCurrentRes
  } = useLoaderData<typeof loader>();
  console.log(data);

  const user: UserInfo = data?.user;
  const workspaces: WorkspacesRes = data?.workspaces;
  const convertWorkspaces = () => {
    const result: { value?: string, label?: string }[] = []
    workspaces?.workspaces?.workspaces?.map(ws => {
      result.push({ value: ws?.workspace_id, label: ws?.workspace_name })
    });
    return result;
  }
  const projects: ApplicationRes = data?.projects;
  const currWs = data?.currWs?.wsCurrent?.workspace_id;
  const [wsId, setWsId] = React.useState(null);

  const handleChange = (value: any) => {
    setWsId(value);
  };
  return (
    <>
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white h-auto">
        <h1 className="md:flex md:items-center md:justify-between md:w-1/6 text-3xl font-bold h-auto w-auto">
          <Link to="/">Home</Link>
          <div className="px-2"></div>
          <Select
            value={wsId ?? currWs}
            onChange={handleChange}
            options={convertWorkspaces()}
            isSearchable={true}
          />
        </h1>
        {
          projects && !projects?.error && projects?.getApplications && projects?.getApplications?.length > 0 ?
            <div>
              {
                projects?.getApplications?.map(project => {
                  return (
                    <p className="md:text-lg text-xs" key={project?.application_id}>{project?.name}</p>
                  );
                })
              }
            </div>
            : <p className="md:text-lg text-xs">You can choose one workspace</p>
        }
        <Form action="/logout" method="post" className="md:flex md:items-center md:justify-between md:p-6">
          <p className="md:text-lg text-xs">{user?.email}</p>
          <div className="px-2"></div>
          <button
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">

        <aside className="w-64" aria-label="Sidebar">
          <div className="overflow-y-auto py-4 px-3 bg-gray-50 rounded dark:bg-gray-800 min-h-screen">
            <ul className="space-y-2">
              <li>
                <a href="#" className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                  <svg aria-hidden="true" className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path></svg>
                  <span className="ml-3">Dashboard</span>
                </a>
              </li>
              <li>
                <button type="button" className="flex items-center p-2 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700" aria-controls="dropdown-example" data-collapse-toggle="dropdown-example">
                  <svg aria-hidden="true" className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"></path></svg>
                  <span className="flex-1 ml-3 text-left whitespace-nowrap" sidebar-toggle-item="">Datastore</span>
                  <svg sidebar-toggle-item="" className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </button>
                {/* <ul id="dropdown-example" className="hidden py-2 space-y-2">
                  <li key={}>

                  </li>
                </ul> */}
              </li>
            </ul>
          </div>
        </aside>

      </main>

      <footer className="p-4 bg-gray-400 shadow md:flex md:items-center md:justify-between md:p-6 dark:bg-gray-900 flex justify-center">
        <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © 2022 <a href="https://en.hexabase.com/our-company/" className="hover:underline">Hexabase すごい</a>
        </span>
      </footer>
    </>
  );
}
