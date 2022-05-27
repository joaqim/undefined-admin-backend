const createURL = (
  url: string,
  resources: string,
  parameters?: Record<string, string | undefined>
) => {
  let id = "";
  let queryString = "";
  if (parameters) {
    let filteredParams: Record<string, string> = {};
    for (let key in parameters) {
      const entry = parameters[key];
      if (entry) {
        if (key == "id") {
          id = entry;
        } else {
          filteredParams[key] = entry;
        }
      }
    }
    queryString = "?" + new URLSearchParams(filteredParams).toString();
  }
  return `${url}/${resources}/${id}${queryString}`;
};

export default createURL;
