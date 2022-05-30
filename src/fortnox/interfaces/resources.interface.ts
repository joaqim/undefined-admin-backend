export const ValidResources = [
  "Invoices",
  "Invoice",
  "Articles",
  "Article",
  "Customers",
  "Customer",
] as const;

type ResourcesTuple = typeof ValidResources;

export type Resources = ResourcesTuple[number];
