import { v4 as uuidv4 } from "uuid";


export const newGuid = (): string => uuidv4();

export const deepClone = <T>(obj: T): T => {
  if (typeof obj !== "object" || obj === null) return obj;
  let newObj: any = obj instanceof Array ? [] : {};
  for (let key in obj) {
    if (obj[key] instanceof Date) {
      newObj[key] = obj[key];
    } else if (typeof obj[key] === "object") {
      newObj[key] = deepClone(obj[key]);
    } else {
      newObj[key] = obj[key];
    }
  }
  return newObj;
};

export const appendQuery = (urlStr: string, name: string, value: string): string => {
  try {
    var url = new URL(urlStr);
    url.searchParams.append(name, value);
    return url.href;
  } catch {
    return urlStr;
  }
};
