import * as React from "react";
import type { LoaderArgs, MetaFunction, ActionArgs, } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useActionData, useLoaderData, useNavigate, useParams, useTransition } from "@remix-run/react";
import Select from 'react-tailwindcss-select';

import { getUser } from "~/service/user/user.server";
import { createWorkspace, getCurrentWorkspace, getWorkspaceDetail, getWorkspaces, setCurrentWorkspace } from "~/service/workspace/workspace.server";
import { getProject } from "~/service/project/project.server";
import SettingIcon from "../../public/assets/setting.svg";
import Logout from "../../public/assets/logout.svg";
import Modal from "~/routes/workspace/$workspaceId/new";
import { Loading } from "~/component/Loading";
import { Sidebar } from "~/component/sidebar";

export const meta: MetaFunction = () => {
  return {
    title: "Workspace",
  };
};

export async function loader({ request, params }: LoaderArgs) {
  let projects;
  const user = await getUser(request);
  const workspaces = await getWorkspaces(request);
  const currWs: any = await getCurrentWorkspace(request);
  const wsDetail = await getWorkspaceDetail(request);
  
  if (!currWs?.error && currWs?.wsCurrent?.workspace_id) {
    projects = await getProject(request, currWs?.wsCurrent?.workspace_id);
  }
  if (!user) return redirect("/");
  
  return json({ user, workspaces, projects, wsDetail });
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
  const navigate = useNavigate();
  const { projectId } = useParams();
  const actionData = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();
  const user = data?.user;
  const workspaces = data?.workspaces;
  const projects = data?.projects;
  const workspaceId = data?.wsDetail?.workspace?.id;
  const wsDetail = data?.wsDetail;
  const { state } = useTransition();
  const loading = state === "loading";
  const submit = state === "submitting";

  const [wsSelect, setWsSelect] = React.useState<any>();
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
      { value: 0, label: `+ Create workspace` }
    ];
    workspaces?.workspaces?.workspaces?.map((ws: any) => {
      result.push({ value: ws?.workspace_id, label: ws?.workspace_name });
    });
    return result;
  };

  const convertWsDetail = () => {
    let result: any = {};

    if (wsDetail && wsDetail?.workspace) {
      result = { value: wsDetail?.workspace?.id, label: wsDetail?.workspace?.name };
    }
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
    setWsSelect(value);
    navigate(`${value?.value}-sl`, { replace: true });
  };

  return (
    <div className="h-full min-h-screen">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white h-auto">
        <h1 className="md:flex md:items-center md:justify-between md:w-1/6 text-3xl font-bold h-auto w-auto">
          <Link to="/">Home</Link>
          <div className="px-2"></div>
          <Select
            loading={loading}
            value={wsSelect ?? convertWsDetail()}
            onChange={(e) => handleChange(e)}
            options={convertWorkspaces()}
            isSearchable={true}
          />
        </h1>
        <div className="md:flex md:items-center md:justify-between md:p-6">
          <NavLink to={workspaceId ?? '/'} title={'workspace setting'} className='hover:bg-white fill-white rounded'>
            <img src={SettingIcon} alt={'setting'} />
          </NavLink>
          <div className="flex-shrink-0 px-5">
            <img className="h-8 w-8" src={user?.userInfo?.profile_pic} alt="avatar" />
          </div>
          <Form action="/logout" method="post">
            <button
              title="logout"
              type="submit"
              className="rounded bg-slate-600 px-2 text-blue-100 hover:bg-white active:bg-white w-10 h-10"
            >
              <img src={Logout} alt="logout" />
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
                  <p className={`${focusProject === project?.application_id ? "bg-yellow-100 text-gray-700" : ''} rounded md:text-sm text-xs hover:bg-yellow-100 hover:text-gray-700 p-4 cursor-pointer`}>
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
        <Sidebar data={undefined} hiddenDropdownSidebar={hiddenDropdownSidebar} onClick={() => setHiddenDropdownSidebar} />

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>

      <footer className="md:flex md:items-center md:justify-center md:p-6 p-4 bg-gray-400 shadow dark:bg-gray-900">
        <span className="text-sm text-gray-800 sm:text-center dark:text-gray-400">
          © {new Date().getFullYear()} <a href="https://en.hexabase.com/our-company/" className="hover:underline">Hexabase すごい</a>
        </span>
      </footer>

      {loading && <Loading />}
      {submit && <Loading />}
      {openModalCreateWs && <Modal setHiddenModal={setHiddenModal} actionData={actionData} />}
    </div>
  );
}
