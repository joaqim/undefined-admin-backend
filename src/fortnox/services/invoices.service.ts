import Axios, { AxiosRequestConfig } from "axios";
import { Invoice } from "findus";
import {
  GetListParams,
  CreateParams,
  UpdateParams,
  GetOneParams,
  DeleteParams,
  UpdateManyParams,
} from "ra-core";
import { FORTNOX_API_URL } from "../../common";
import { CRUD } from "../../common/interfaces/crud.interface";
import capitalizeFirstLetter from "../../utils/capitalizeFirstLetter";
import createURL from "../../utils/createURL";
import FortnoxServices from "./fortnox.service";

class InvoicesService implements Partial<CRUD<Invoice>> {
  public static async list(page: number, limit: number) {
    return FortnoxServices.getResource<Invoice[]>(
      "Invoices",
      { method: "GET" },
      { page, limit }
    );
  }

  public static async get(params: GetOneParams<any>) {
    return FortnoxServices.getResource<Invoice>(
      "Invoice",
      { method: "GET" },
      { id: params.id }
    );
  }
  /*
  public static async create(params: CreateParams<any>) {}
  public static async update(params: UpdateParams<any>) {}
  public static async get(params: GetOneParams<any>) {}
  public static async delete(params: DeleteParams<any>) {}
  public static async updateMany(params: UpdateManyParams<any>) {}
  */
}

export default InvoicesService;
