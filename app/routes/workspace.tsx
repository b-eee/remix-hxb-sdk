import * as React from "react";
import { LoaderArgs, MetaFunction, redirect, json, ActionArgs } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useActionData, useLoaderData, useParams, useTransition } from "@remix-run/react";
import Select from 'react-tailwindcss-select';

import { getUser } from "~/service/user/user.server";
import { createWorkspace, getCurrentWorkspace, getWorkspaces, setCurrentWorkspace } from "~/service/workspace/workspace.server";
import { getProject } from "~/service/project/project.server";
import PlusIcon from "../../public/assets/plus.svg";
import SettingIcon from "../../public/assets/setting.svg";
import Modal from "~/routes/workspace/$workspaceId/new";
import { Loading } from "~/component/Loading";

export const meta: MetaFunction = () => {
  return {
    title: "Workspace",
  };
};

export async function loader({ request }: LoaderArgs) {
  let projects;
  const user = await getUser(request);
  const workspaces = await getWorkspaces(request);
  const currWs: any = await getCurrentWorkspace(request);

  if (!currWs?.error && currWs?.wsCurrent?.workspace_id) {
    projects = await getProject(request, currWs?.wsCurrent?.workspace_id);
  }

  if (!user) return redirect("/");
  return json({ user, workspaces, projects, currWs });
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const name = formData.get("nameWs");

  if (typeof name !== "string" || name?.length === 0) {
    return json(
      { errors: { title: null, name: "Name is required" } },
      { status: 400 }
    );
  }

  if (typeof name !== "string" || name?.length === 0) {
    return json(
      { errors: { title: null, name: "Name is required" } },
      { status: 400 }
    );
  }

  const newWs = await createWorkspace(request, { name });

  if (newWs?.w_id) {
    await setCurrentWorkspace(request, { workspace_id: newWs?.w_id });
  }
  return redirect(`/workspace/${newWs?.w_id}`);
}

export default function Workspace() {
  const { projectId } = useParams();
  const actionData = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();
  const workspaces = data?.workspaces;
  const projects = data?.projects;
  const workspaceId = data?.currWs?.wsCurrent?.workspace_id;
  const { state } = useTransition();
  const loading = state === "loading";
  const submit = state === "submitting";

  const [wsId, setWsId] = React.useState(null);
  const [openModalCreateWs, setOpenModalCreateWs] = React.useState<boolean>(false);
  const [hiddenDropdownSidebar, setHiddenDropdownSidebar] = React.useState<boolean>(false);
  const [focusProject, setFocusProject] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (projectId) {
      setFocusProject(projectId);
    } else {
      setFocusProject(undefined);
    }
  }, []);

  React.useEffect(() => {
    if (actionData?.errors === undefined) {
      setOpenModalCreateWs(false);
    }
    if (projectId) {
      setFocusProject(projectId);
    } else {
      setFocusProject(undefined);
    }
  }, [data]);

  const convertWorkspaces = () => {
    const result: any = [
      { value: 0, label: `+ Create workspace` } //${<img src={PlusIcon}></img>}
    ];
    workspaces?.workspaces?.workspaces?.map((ws: any) => {
      result.push({ value: ws?.workspace_id, label: ws?.workspace_name });
    });
    return result;
  };

  const setHiddenModal = (childData: boolean) => {
    setOpenModalCreateWs(childData)
  }

  const handleChange = (value: any) => {
    if (value?.value === 0) {
      setOpenModalCreateWs(!openModalCreateWs);
    } else {
      setOpenModalCreateWs(false);
    }
    setWsId(value);
  };

  return (
    <div className="h-full min-h-screen">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white h-auto">
        <h1 className="md:flex md:items-center md:justify-between md:w-1/6 text-3xl font-bold h-auto w-auto">
          <Link to="/">Home</Link>
          <div className="px-2"></div>
          <Select
            loading={loading}
            value={workspaceId ?? wsId}
            onChange={(e) => handleChange(e)}
            options={convertWorkspaces()}
            isSearchable={true}
          />
        </h1>
        <div className="md:flex md:items-center md:justify-between md:p-6">
          <NavLink to={workspaceId} title={'workspace setting'}>
            <img src={SettingIcon} alt={'setting'} />
          </NavLink>
          <div className="px-2"></div>
          <Form action="/logout" method="post">
            <button
              type="submit"
              className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
            >
              Logout
            </button>
          </Form>
        </div>

      </header>
      <div className="flex items-center justify-center w-full bg-black text-white h-auto overflow-x-scroll">
        {projects && !projects?.error && projects?.appAndDs && projects?.appAndDs?.length > 0
          ? <div className="lg:max-w-7xl md:max-w-3xl sm:max-w-xl flex items-center justify-between h-auto">
            {projects?.appAndDs?.map((project) => {
              return (
                <NavLink key={project?.application_id} to={`${workspaceId}/project/${project?.application_id}`} title={'workspace setting'} onClick={() => setFocusProject(project?.application_id)}>
                  <p className={`${focusProject === project?.application_id ? "bg-yellow-100 text-gray-700" : ''} md:text-sm text-xs hover:bg-yellow-100 hover:text-gray-700 p-4 cursor-pointer`}>
                    {project?.name}
                  </p>
                </NavLink>
              );
            })
            }
          </div>
          : <div className="flex items-center justify-center h-auto">
            <p className="md:text-lg text-xs">Not have project</p>
          </div>
        }
      </div>

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
                <button
                  onClick={() => setHiddenDropdownSidebar(!hiddenDropdownSidebar)}
                  type="button" className="flex items-center p-2 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700" aria-controls="dropdown-example" data-collapse-toggle="dropdown-example">
                  <svg aria-hidden="true" className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"></path></svg>
                  <span className="flex-1 ml-3 text-left whitespace-nowrap" sidebar-toggle-item="">Datastore</span>
                  <svg sidebar-toggle-item="" className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </button>
                <ul id="dropdown-example" className={`${hiddenDropdownSidebar ? 'hidden' : ''} py-2 space-y-2`}>
                  <a href="#" className="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Products</a>
                  <a href="#" className="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Products</a>
                  <a href="#" className="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Products</a>
                </ul>
              </li>
            </ul>
          </div>
        </aside>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>

      <footer className="md:flex md:items-center md:justify-center md:p-6 p-4 bg-gray-400 shadow dark:bg-gray-900">
        <span className="text-sm text-gray-800 sm:text-center dark:text-gray-400">
          © 2022 <a href="https://en.hexabase.com/our-company/" className="hover:underline">Hexabase すごい</a>
        </span>
      </footer>

      {loading && <Loading />}
      {submit && <Loading />}
      {openModalCreateWs && <Modal setHiddenModal={setHiddenModal} actionData={actionData} />}
    </div>
  );
}
