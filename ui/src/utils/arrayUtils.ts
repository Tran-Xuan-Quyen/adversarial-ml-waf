export const addKeyElement = (arr: any) => {
  const newArr = arr.map((element: any, index: any) => ({
    ...element,
    key: element.id,
  }));
  return newArr;
};

export const findElementById = (arr: any, value: string) => {
  return arr.find((obj: any) => obj.id === value);
};

export const checkListTypeKey = (key: string) => {
  const dateKeyGroups = ["frequency", "storage", "connection"];
  return dateKeyGroups.includes(key);
};

export const checkDeletedDetail = (
  currentDetail: Array<any>,
  deletedDetail: Array<any>
) => {
  return currentDetail.filter(
    (current) => !deletedDetail.some((deleted) => current.id === deleted.id)
  );
};

export const checkAddedDetail = (
  currentDetail: Array<any>,
  addedDetail: Array<any>
) => {
  return addedDetail.filter(
    (added) => !currentDetail.some((current) => added.id === current.id)
  );
};
