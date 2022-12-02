import quip from "quip-apps-api";
import OAuth2 from "quip-apps-api/dist/oauth-2";
import Authorization from "./Authorization";

interface apiWrapper {
  method?: string;
  data?: any;
  url: string;
}
export const apiWrapper = async (
  params: apiWrapper,
  tryRefresh = true,
  refreshedhAccessToken:string|null=null
): Promise<any> => {
  const savedAccessToken = quip.apps.getRootRecord().get('accessToken')
  const accessToken=refreshedhAccessToken||savedAccessToken
  let response;
  if (params.method === "PUT" || params.method === "POST" || params.method === "PATCH") {
    response = await fetch(params.url, {
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Content-Type": "application/json"
      },
      method: params.method,
      body: JSON.stringify(params.data)
    })
  } else if(params.method==="DELETE") {
    response = await fetch(params.url, {
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Content-Type": "application/json"
      },
      method: params.method,
    })
  } else {
    response = await fetch(params.url, {
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Content-Type": "application/json"
      }
    })
  }
  if (response.status == 401 && tryRefresh) {
    const result = await Authorization.getAccessToken(true);
    if (result.error) return result.error;
    return await apiWrapper(params, false, result.access_token);
  } else if (response.ok) {
    if(response.status===204){
      return {}
    }
    return response.json();
  } else {
    return { error: "Something wrong. Please try again." };
  }
};

