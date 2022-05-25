const authHeader = (clientId: string, clientSecret: string) =>
  "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
export default authHeader;
