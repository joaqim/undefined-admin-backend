import Axios, { AxiosRequestConfig, Method } from "axios";
import { FORTNOX_API_URL, FORTNOX_DEFAULT_HEADERS } from "../../common";
import { Resources } from "../../interfaces/fortnox/resources.interface";
import createURL from "../../utils/createURL";
import { FortnoxMetaInformation } from "../../utils/fortnoxUtils";

class FortnoxServices {
  private static async axios(
    accessToken: string,
    resources: Resources,
    config: AxiosRequestConfig & { method: Method },
    params?: any
  ) {
    const url = createURL(FORTNOX_API_URL, resources, params);
    return await Axios({
      ...config,
      url,
      headers: {
        ...FORTNOX_DEFAULT_HEADERS,
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
  private static get = async (
    accessToken: string,
    resources: Resources,
    params?: any
  ) => this.axios(accessToken, resources, { method: "GET" }, params);

  private static put = async (
    accessToken: string,
    resources: Resources,
    data: any,
    params?: any
  ) => this.axios(accessToken, resources, { method: "PUT", data }, params);

  private static post = async (
    accessToken: string,
    resources: Resources,
    data: any,
    params?: any
  ) => this.axios(accessToken, resources, { method: "POST", data }, params);

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
    console.log({meta})

    return { data: data[resources] as TResource[], meta };
  }

  public static async update<TResource = Partial<unknown>>(
    accessToken: string,
    resources: Resources,
    data: TResource,
    params: { id: string }
  ) {
    return this.put(accessToken, resources, data, params);
  }

  public static async create<TResource = Partial<unknown>>(
    accessToken: string,
    resources: Resources,
    data: TResource
  ) {
    return this.post(accessToken, resources, data);
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
