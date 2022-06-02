import { Resources } from "../interfaces/fortnox/resources.interface";

const FortnoxApiResourceLookup: Record<Resources, string> = {
  Invoice: "invoices",
  Invoices: "invoices",
  Article: "articles",
  Articles: "articles",
  Customer: "customers",
  Customers: "customers",
  Inbox: "inbox",
};

const createURL = (
  url: string,
  resources: Resources,
  parameters?: Record<string, string | number | undefined> & {
    id?: string;
    action?: string;
  }
) => {
  let id = "";
  let action = "";
  let queryString = "";
  if (parameters) {
    let filteredParams: Record<string, string> = {};
    for (let key in parameters) {
      const value = typeof (parameters[key] != "number")
        ? parameters[key]?.toString()
        : (parameters[key] as string);

      if (value) {
        if (key === "id") {
          id = value;
        } else if (key === "action") {
          action = value;
        } else {
          filteredParams[key] = value;
        }
      }
    }
    queryString = "?" + new URLSearchParams(filteredParams).toString();
    if (action) queryString += `/${action}`;
  }

  const resource = FortnoxApiResourceLookup[resources];

  return `${url}/${resource}/${id}${queryString}`;
};

export default createURL;
