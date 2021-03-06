export const ValidResources = [
  "Invoices",
  "Invoice",
  "Articles",
  "Article",
  "Customers",
  "Customer",
  "Inbox",
] as const;

export const ListResources = ["Invoices", "Articles", "Customers"] as const;

type ResourcesTuple = typeof ValidResources;

export type Resources = ResourcesTuple[number];

const resourceSingleLookup: Record<Resources, Resources> = {
  Invoices: "Invoice",
  Invoice: "Invoice",
  Articles: "Article",
  Article: "Article",
  Customers: "Customer",
  Customer: "Customer",
  Inbox: "Inbox"
};

export const singularResource = (resources: Resources): Resources =>
  resourceSingleLookup[resources];
