import type {
  GetListParams,
  CreateParams,
  UpdateParams,
  UpdateManyParams,
  GetOneParams,
  DeleteParams,
} from "ra-core";

export interface CRUD<ResourceType = unknown> {
  list: (params: GetListParams) => Promise<ResourceType[]>;
  create: (params: CreateParams) => Promise<ResourceType>;
  update: (params: UpdateParams) => Promise<ResourceType>;
  get: (params: GetOneParams) => Promise<ResourceType>;
  delete: (params: DeleteParams) => Promise<ResourceType>;
  updateMany: (params: UpdateManyParams) => Promise<ResourceType[]>;
}
