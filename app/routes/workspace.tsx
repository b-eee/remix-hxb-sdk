import * as React from "react";
import type { LoaderArgs, MetaFunction, ActionArgs, } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useActionData, useLoaderData, useNavigate, useParams, useTransition } from "@remix-run/react";
import Select from 'react-tailwindcss-select';

import { getUser } from "~/service/user/user.server";
import { createWorkspace, getCurrentWorkspace, getWorkspaceDetail, getWorkspaces, setCurrentWorkspace } from "~/service/workspace/workspace.server";
import { createProject, deleteProject, getDetailProject, getProjectsAndDatastores, getTemplates, updateProjectName } from "~/service/project/project.server";
import SettingIcon from "../../public/assets/setting.svg";
import Logout from "../../public/assets/logout.svg";
import LogoHxb from "../../public/assets/hexabase.png";
import Home from "../../public/assets/home.svg";
import MenuMobileIcon from "../../public/assets/menu-icon-mobile.svg";
import PlusWhiteOutline from "../../public/assets/plus-white-outline.svg";
import Modal from "~/routes/workspace/$workspaceId/new";
import { Loading } from "~/component/Loading";
import { Sidebar } from "~/component/sidebar";
import NewProject from "./workspace/$workspaceId/project/$projectId/new";
import { MenuMobile } from "./workspace/menuMobile";

export const meta: MetaFunction = () => {
  return {
    title: "RemixJs-Hexabase",
  };
};

export async function loader({ request }: LoaderArgs) {
  let projects;
  const fetchUser = getUser(request);
  const fetchWorkspaces = getWorkspaces(request);
  const fetchCurrWs = getCurrentWorkspace(request);
  const fetchWsDetail = getWorkspaceDetail(request);
  const fetchTemplateProjects = getTemplates(request);

  const [user, workspaces, currWs, wsDetail, templates] = await Promise.all([fetchUser, fetchWorkspaces, fetchCurrWs, fetchWsDetail, fetchTemplateProjects]);

  if (!currWs?.error && currWs?.wsCurrent?.workspace_id) {
    projects = await getProjectsAndDatastores(request, currWs?.wsCurrent?.workspace_id);
  }
  if (!user) return redirect("/");

  return json({ user, workspaces, projects, wsDetail, templates });
}

export async function action({ request, params }: ActionArgs) {
  let projects;
  let newWs;
  const fetchFormData = request.formData();
  const fetchTemplateProjects = getTemplates(request);
  const fetchCurrWs = getCurrentWorkspace(request);
  let [formData, templateProjects, currWs] = await Promise.all([fetchFormData, fetchTemplateProjects, fetchCurrWs]);

  const createWs = formData.get('createWs');
  const name = formData.get("nameWs");
  const nameProjectEnCreate = formData.get('nameProjectEnCreate');
  const typeCreate = formData.get('create');

  if (params?.workspaceId) {
    projects = await getProjectsAndDatastores(request, params?.workspaceId);
  }

  if (createWs === 'createWs') {
    if (typeof name !== "string" || name?.length === 0) {
      return json(
        { errors: { title: null, name: "Name is required" } },
        { status: 400 }
      );
    }

    newWs = await createWorkspace(request, { name });

    if (newWs?.w_id) {
      await setCurrentWorkspace(request, { workspace_id: newWs?.w_id });
    }

  }
  // create project
  if (typeCreate === 'create') {
    let tpId: any = '';
    let cateSelectFrom: any = '';

    if (templateProjects && templateProjects?.getTemplates && templateProjects?.getTemplates?.categories) {
      templateProjects?.getTemplates?.categories?.map(v => {
        cateSelectFrom = formData.get(v?.category)?.toString();
      });
      const categorySelected: any = templateProjects?.getTemplates?.categories?.find(v => v?.category === cateSelectFrom);
      categorySelected && categorySelected?.templates && categorySelected?.templates?.map((v: any) => {
        tpId = formData.get(v?.tp_id)?.toString();
      });
    }
    if (typeof nameProjectEnCreate !== 'string' || nameProjectEnCreate?.length === 0) {
      return json(
        { errors: { title: 'nameProjectEnCreate', name: 'Field is required' } },
        { status: 400 }
      );
    }
    const newProject = await createProject(request, { name: { en: nameProjectEnCreate, ja: nameProjectEnCreate }, tp_id: tpId });
    if (newProject?.error) {
      return json(
        { errors: { title: null, name: 'Data invalid' } },
        { status: 400 }
      );
    } else {
      return redirect(`workspace/${currWs?.wsCurrent?.workspace_id}/project/${newProject?.app?.project_id}`);
    }
  }

  return redirect(`/workspace/${newWs?.w_id}`);
}

export default function Workspace() {
  const navigate = useNavigate();
  const params = useParams();
  const { projectId } = useParams();
  const actionData = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();
  const user = data?.user;
  const workspaces = data?.workspaces;
  const projects = data?.projects;
  const workspaceId = data?.wsDetail?.workspace?.id;
  const wsDetail = data?.wsDetail;
  const templateProjects = data?.templates?.getTemplates;
  const { state } = useTransition();
  const loading = state === 'loading' || state === 'submitting';

  const [wsSelect, setWsSelect] = React.useState<any>();
  const [openModalCreateWs, setOpenModalCreateWs] = React.useState<boolean>(false);
  const [hiddenDropdownSidebar, setHiddenDropdownSidebar] = React.useState<boolean>(false);
  const [focusProject, setFocusProject] = React.useState<string | undefined>();
  const [openNewModal, setOpenNewModal] = React.useState<boolean>(false);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

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
    if (actionData?.errors === undefined) {
      setOpenNewModal(false);
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
      navigate(`${value?.value}-sl`, { replace: true });
      // window.location.reload();
    }
    setWsSelect(value);
  };

  const setHiddenCreate = (childData: boolean) => {
    setOpenNewModal(childData);
  }

  const maxScrollWidth = React.useRef(0);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const carousel = React.useRef<any>(null);

  const movePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevState) => prevState - 1);
    }
  };

  const moveNext = () => {
    if (
      carousel?.current !== null &&
      carousel?.current?.offsetWidth * currentIndex <= maxScrollWidth?.current
    ) {
      setCurrentIndex((prevState) => prevState + 1);
    }
  };

  const isDisabled = (direction: string) => {
    if (direction === 'prev') {
      return currentIndex <= 0;
    }
    if (direction === 'next' && carousel?.current !== null) {
      return (
        carousel?.current?.offsetWidth * currentIndex >= maxScrollWidth?.current
      );
    }
    return false;
  };

  React.useEffect(() => {
    if (carousel !== null && carousel?.current !== null) {
      carousel.current.scrollLeft = carousel?.current?.offsetWidth * currentIndex;
    }
  }, [currentIndex]);

  React.useEffect(() => {
    maxScrollWidth.current = carousel?.current
      ? carousel?.current?.scrollWidth - carousel?.current?.offsetWidth
      : 0;
  }, []);

  return (
    <div className="h-full min-h-screen w-full">
      <nav className="flex items-center justify-between bg-slate-100 px-2 py-1 text-gray-700 max-h-16 h-auto w-auto">
        <div className="flex items-center md:justify-between text-3xl font-bold h-auto w-auto gap-2">
          <img className="md:hidden block" src={MenuMobileIcon} alt="menuMobile" width={'100%'} height={'100%'} onClick={() => setIsOpen(!isOpen)} />
          <div className="w-0 md:block hidden transform min-w-[94px]">
            <NavLink to="dashboard">
              <img src={LogoHxb} alt="logo_hexabase" width='100%' height='100%' />
            </NavLink>
          </div>
          <div className="min-w-full w-auto">
            <Select
              loading={loading}
              value={wsSelect ?? convertWsDetail()}
              onChange={(e) => handleChange(e)}
              options={convertWorkspaces()}
              isSearchable={true}
              searchInputPlaceholder={'Input workspace name'}
            />
          </div>
        </div>
        <div className="w-24 md:opacity-0 min-w-[94px] opacity-100 transition-all ease-in-out duration-700 delay-2">
          <NavLink to="dashboard">
            <img src={LogoHxb} alt="logo_hexabase" width='100%' height='100%' />
          </NavLink>
        </div>
        <NavLink to={workspaceId ?? '/'} title={'workspace setting'} className='md:hidden block'>
          <img src={SettingIcon} alt={'setting'} />
        </NavLink>
        <div className="md:flex hidden items-center justify-between gap-3">
          <NavLink to={workspaceId ?? '/'} title={'workspace setting'} className=''>
            <img src={SettingIcon} alt={'setting'} />
          </NavLink>
          <div className="flex-shrink-0 cursor-pointer rounded-full">
            <img className="h-8 w-8" src={user?.userInfo?.profile_pic ?? ''} alt="avatar" width='100%' height='100%' />
          </div>
          <Form action="/logout" method="post">
            <button
              title="logout"
              type="submit"
              className="rounded active:bg-white w-8 h-8"
            >
              <img src={Logout} alt="logout" />
            </button>
          </Form>
        </div>
      </nav>

      <div className="relative flex flex-1 items-center justify-between w-full bg-black text-white">
        <div className="md:w-[36px] w-10 h-full flex items-center justify-center px-1 cursor-pointer">
          <Link to={"dashboard"}><img src={Home} alt="home" width='100%' height='100%' /></Link>
        </div>
        <div className="grow relative overflow-hidden h-9 flex">
          <button
            onClick={movePrev}
            className="bg-white text-white w-5 h-full text-center opacity-60 hover:opacity-100 disabled:opacity-35 disabled:cursor-not-allowed z-10 p-0 m-0 transition-all ease-in-out duration-300"
            disabled={isDisabled('prev')}
          >
            <div className="w-5 h-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="fill-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </button>
          <div
            ref={carousel}
            className={`carousel-container relative flex flex-auto items-center ${projects?.appAndDs && projects?.appAndDs?.length > 5 ? 'justify-between' : 'justify-center'} overflow-hidden scroll-smooth snap-x snap-mandatory touch-pan-x z-0`}
          >
            {projects && !projects?.error && projects?.appAndDs && projects?.appAndDs?.length > 0
              ? <>
                {projects?.appAndDs?.map((project) => (
                  <div
                    key={project?.application_id}
                    className="carousel-item text-center relative w-auto h-auto snap-start"
                  >
                    <NavLink
                      key={project?.application_id}
                      to={`${workspaceId}/project/${project?.application_id}`}
                      onClick={() => setFocusProject(project?.application_id)}
                    >
                      <div className={`${focusProject === project?.application_id ? "bg-yellow-100 text-gray-700" : ''} whitespace-nowrap md:text-sm text-xs hover:bg-yellow-100 hover:text-gray-700 px-4 py-2 cursor-pointer dark:hover:bg-white dark:hover:text-gray-800`}>
                        {project?.name}
                      </div>
                    </NavLink>
                  </div>
                )
                )}
              </>
              : <div className="flex items-center justify-center h-auto">
                <p className="md:text-lg text-sm">Not have project</p>
              </div>
            }
          </div>
          <button
            onClick={moveNext}
            className="bg-white text-white w-5 h-full text-center opacity-60 hover:opacity-100 disabled:opacity-35 disabled:cursor-not-allowed z-10 p-0 m-0 transition-all ease-in-out duration-300"
            disabled={isDisabled('next')}
          >
            <div className="w-5 h-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="fill-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
        <div className="flex items-center justify-between gap-5 px-2">
          <div className="w-5 h-full cursor-pointer" onClick={() => setOpenNewModal(!openNewModal)}>
            <img src={PlusWhiteOutline} alt="PlusWhiteOutline" width='100%' height='100%' />
          </div>
        </div>
      </div>

      <main className="md:flex h-auto bg-white">
        <Sidebar data={undefined} hiddenDropdownSidebar={hiddenDropdownSidebar} onClick={() => setHiddenDropdownSidebar(!hiddenDropdownSidebar)} />
        {params?.projectId
          ? <div className="flex-1 p-6">
            <Outlet />
          </div>
          : <div className="font-bold text-base text-gray-700 m-5">Please select project</div>}
      </main>

      <footer className="flex items-center justify-center md:p-6 p-4 bg-gray-400 shadow dark:bg-gray-900 w-full h-auto">
        <span className="text-sm text-gray-800 sm:text-center dark:text-gray-400">
          ?? {new Date().getFullYear()} <a href="https://en.hexabase.com/our-company/" target={"_blank"} className="hover:underline">Hexabase ?????????</a>
        </span>
      </footer>

      {loading ? <Loading /> : null}
      {openNewModal ? <NewProject actionData={actionData} setHiddenModal={setHiddenCreate} templateProjects={templateProjects} /> : null}
      {openModalCreateWs ? <Modal setHiddenModal={setHiddenModal} actionData={actionData} /> : null}
      {isOpen ? <MenuMobile isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} /> : null}
    </div>
  );
}
