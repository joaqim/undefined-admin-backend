import Axios, { AxiosPromise, AxiosResponse } from "axios";
import { URLSearchParams } from "url";
import authHeader from "../utils/authHeader";

const { FORTNOX_CLIENT_ID, FORTNOX_CLIENT_SECRET, FORTNOX_REDIRECT_URI } =
  process.env;

class TokenService {
  private static readonly authTokenUri =
    "https://apps.fortnox.se/oauth-v1/token";

  public static async axiosRequest(
    codeOrToken: string,
    grantType: "authorization_code" | "refresh_token",
    redirectUri: string
  ): Promise<AxiosResponse<any>> {
    const params = new URLSearchParams({
      grant_type: grantType,
    });

    if (grantType === "authorization_code") {
      params.append("code", codeOrToken);
      params.append("redirect_uri", redirectUri);
    } else {
      params.append("refresh_token", codeOrToken);
    }

    return await Axios({
      method: "POST",
      url: this.authTokenUri,
      data: params.toString(),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "Access-Control-Allow-Origin": "*",
        Authorization: authHeader(FORTNOX_CLIENT_ID!, FORTNOX_CLIENT_SECRET!),
      },
    });
  }
}

export default TokenService;
