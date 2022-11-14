import * as React from "react";
import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams, useTransition } from "@remix-run/react";
import { createClient } from "@hexabase/hexabase-js";

import { createUserSession } from "~/session.server";
import { safeRedirect, validateEmail } from "~/utils";
import { UserInfo } from "~/respone/user";
import { getUser } from "~/service/user/user.server";
import IconHxb from "../../public/assets/hexabaseImage.svg"
import EyeNo from "../../public/assets/eye-no-password.svg"
import Eye from "../../public/assets/eye-password.svg"
import { Loading } from "~/component/Loading";

export const meta: MetaFunction = () => {
  return {
    title: "Login",
  };
};

export async function loader({ request }: LoaderArgs) {
  const user: any = await getUser(request);
  if (user && user?.userInfo?.email) return redirect("/workspace/dashboard");
  else return json({});
}

export async function action({ request }: ActionArgs) {
  let userInfoRes: UserInfo | undefined;
  const baseUrl = process.env.BASE_URL || "";
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/workspace/dashboard");
  const remember = formData.get("remember");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null } },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { email: null, password: "Password is required" } },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return json(
      { errors: { email: null, password: "Password is too short" } },
      { status: 400 }
    );
  }

  const hexabase = await createClient({ url: baseUrl, token: "", email, password });

  if (!hexabase) {
    return json(
      { errors: { email: "Invalid email or password", password: null } },
      { status: 400 }
    );
  }

  const { token, error } = await hexabase.auth.login({ email, password });

  if (error) {
    return json(
      { errors: { email: "Invalid email or password", password: null } },
      { status: 400 }
    );
  }

  return createUserSession({
    request,
    token: token,
    remember: remember === "on" ? true : false,
    redirectTo,
  });
}

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/workspace/dashboard";
  const actionData = useActionData<typeof action>();
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const { state } = useTransition();
  const loading = state === 'loading' || state === 'submitting';

  const [showPass, setShowPass] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <div className="max-w-[370px] flex justify-center items-center px-2"><img src={IconHxb} alt="Hexabase Logo" width={'100%'} height={'100%'} /></div>
        <Form method="post" className="space-y-6 m-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                ref={emailRef}
                id="email"
                required
                autoFocus={true}
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
                className="w-full rounded border border-gray-500 p-2 text-sm text-gray-700"
              />
              {actionData?.errors?.email && (
                <div className="pt-1 text-red-700" id="email-error">
                  {actionData.errors.email}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                ref={passwordRef}
                name="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
                className="w-full rounded border border-gray-500 p-2 text-sm text-gray-700"
              />
              <div
                onClick={() => setShowPass(!showPass)}
                className="max-w-[20px] max-h-[20px] absolute right-4 top-2 cursor-pointer">
                <img src={showPass ? Eye : EyeNo} alt={showPass ? 'Eye' : "EyeNo"} width={'100%'} height={'100%'} />
              </div>
              {actionData?.errors?.password && (
                <div className="pt-1 text-red-700" id="password-error">
                  {actionData.errors.password}
                </div>
              )}
            </div>
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button
            type="submit"
            className="w-full rounded bg-gradient-to-r from-green-300 via-blue-200 to-pink-300 py-2 px-4 text-white hover:bg-gradient-to-l hover:from-green-300 hover:via-pink-300 hover:to-blue-200 transition delay-150 duration-150 ease-in-out"
          >
            Log in
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-900 cursor-pointer"
              >
                Remember me?
              </label>
            </div>
            {/* <div className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: "/join",
                  search: searchParams.toString(),
                }}
              >
                Sign up
              </Link>
            </div> */}
          </div>
        </Form>
      </div>

      {loading && <Loading />}

    </div>
  );
}
