const createURL = (
  url: string,
  resources: string,
  parameters?: Record<string, string | undefined> & {
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
      const value = parameters[key];
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
  return `${url}/${resources}/${id}${queryString}`;
};

export default createURL;
