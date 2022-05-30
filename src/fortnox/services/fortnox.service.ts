import Axios, { AxiosRequestConfig, Method } from "axios";
import { FORTNOX_API_URL } from "../../common";
import capitalizeFirstLetter from "../../utils/capitalizeFirstLetter";
import createURL from "../../utils/createURL";
import { Resources } from "../interfaces/resources.interface";

class FortnoxServices {
  public static async getResource<TResource = unknown>(
    resources: Resources,
    axiosConf: AxiosRequestConfig & { method: Method },
    params?: any
  ): Promise<TResource> {
    const url = createURL(FORTNOX_API_URL, resources, params);
    const { data } = await Axios({ ...axiosConf, url });
    return data[resources] as TResource;
  }

  public static async list<TResource = unknown>(
    resources: Resources,
    params?: any
  ) {
    const url = createURL(FORTNOX_API_URL, resources, params);
    const { data } = await Axios({ method: "GET", url });
    return data[resources] as TResource[];
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
