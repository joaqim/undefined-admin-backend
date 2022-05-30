export interface FortnoxMetaInformation {
  "@CurrentPage": number;
  "@TotalPages": number;
  "@TotalResources": number;
}

export type FortnoxData<Resource, ResourceKey extends string> = Record<
  ResourceKey,
  Resource
> & { MetaInformation?: FortnoxMetaInformation };

export const sendBackFortnoxData = <Resource /* , ResourceKey extends string */>(
  data: any, // FortnoxData<Resource, ResourceKey>,
  resourceKey: string,
  res: any
) => {
  //let resourcesDataType = capitalizeFirstLetter(resources);

  let resource = data[resourceKey] as Resource;

  let totalCount = Array.isArray(resource) ? resource.length ?? 1 : 1;

  res.set({
    "Access-Control-Expose-Headers": ["Content-Range", "X-Total-Count"],
    "Access-Control-Allow-Methods": "*",
    "X-Total-Count": totalCount,
  });

  if (data.MetaInformation) {
    let totalResources = data.MetaInformation["@TotalResources"];
    let totalPages = data.MetaInformation["@TotalPages"];
    let currentPage = data.MetaInformation["@CurrentPage"];

    res.set({
      "Content-Range": `${resourceKey}:${currentPage}-${totalPages}/${totalResources}`,
    });

    // Add missing id to content array
    if (
      Array.isArray(resource) &&
      !(resource[0] as { id?: string | number })?.id
    ) {
      resource.forEach(
        (dataItem: { id?: number }, index: number) => (dataItem.id = index)
      );
    }
  }
  return res.status(200).send(data);
};
