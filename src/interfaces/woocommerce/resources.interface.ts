export const ValidResources = ["Orders", "Refunds"] as const;


type ResourceTuple = typeof ValidResources;
export type Resources = ResourceTuple[number];
