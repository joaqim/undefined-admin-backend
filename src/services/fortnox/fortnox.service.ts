import Axios, { AxiosRequestConfig, Method } from "axios";
import { FORTNOX_API_URL, FORTNOX_DEFAULT_HEADERS } from "../../common";
import { Resources } from "../../interfaces/fortnox/resources.interface";
import capitalizeFirstLetter from "../../utils/capitalizeFirstLetter";
import createURL from "../../utils/createURL";
import { FortnoxMetaInformation } from "../../utils/fortnoxUtils";

class FortnoxServices {
  private static async get(
    accessToken: string,
    resources: Resources,
    params?: any
  ) {
    const url = createURL(FORTNOX_API_URL, resources, params);
    return await Axios({
      method: "GET",
      url,
      timeout: 5000, // Wait 5 seconds
      headers: {
        ...FORTNOX_DEFAULT_HEADERS,
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
  public static async getOne<TResource = unknown>(
    accessToken: string,
    resources: Resources,
    params?: any
  ): Promise<TResource> {
    const { data } = await this.get(accessToken, resources, params);
    return data[resources] as TResource;
  }

  public static async getMany<TResource = unknown>(
    accessToken: string,
    resources: Resources,
    params?: any
  ) {
    const { data } = await this.get(accessToken, resources, params);
    const meta = data["MetaInformation"] as FortnoxMetaInformation;

    return { data: data[resources] as TResource[], meta };
  }

  /*
  list: (resource: string, params: GetListParams) => Promise<unknown[]>;
  create: (resource: string, params: CreateParams<any>) => Promise<unknown>;
  update: (resource: string, params: UpdateParams<any>) => Promise<unknown>;
  get: (resource: string, params: GetOneParams<any>) => Promise<unknown>;
  delete: (resource: string, params: DeleteParams<any>) => Promise<unknown>;
  updateMany: (
    resource: string,
    params: UpdateManyParams<any>
  ) => Promise<unknown[]>;
  */
}

export default FortnoxServices;
