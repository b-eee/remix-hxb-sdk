import { USER_TOKEN } from "~/constant/user";
import { getSession } from "~/session.server";

export async function getTokenFromCookie(request: Request): Promise<string | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  return token ?? undefined;
}

const toBase64 = (file: any) =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = (error) => reject(error);
	});
export {
	toBase64
}