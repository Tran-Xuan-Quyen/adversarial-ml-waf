export const validateEmail = (email: string): boolean => {
  const reg =
    /^(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z]|([\dA-Za-z]|([\dA-Za-z][^\s"(),.:;<>@[\\\]]*[\dA-Za-z]))\.)+([A-Za-z]|([A-Za-z][\dA-Za-z][^\s"(),.:;<>@[\\\]]*[A-Za-z]))\.?))$/;
  return reg.test(email);
};

export const validatePassword = (password: string): boolean => {
  const reg = /^(.{0,7}|[^0-9]*|[^A-Za-z]*|[a-zA-Z0-9]*)$/;
  return reg.test(password);
};

export const validateTelephone = (telephone: string): boolean => {
  const reg = /^[+]{0,}[0-9()-\s]+$/;
  return reg.test(telephone);
};

export const validateNumberOnly = (param: string): boolean => {
  const number_only = /^\d+(\.{1}\d+)?$/;
  return number_only.test(param);
};

export const validateCharOnly = (param: string): boolean => {
  const char_only = /^[A-Za-z]+$/;
  return char_only.test(param);
};

export const validateSpecialOnly = (param: string): boolean => {
  const special_only = /^[~`!@#$%^&*()\-_+=[\]{}|\\:;"'<,>.?/\s]+$/;
  return special_only.test(param);
};

export const validateName = (param: string): boolean => {
  const name_only =
    /^([^`+~#$%^&*()|}{="'！￥……（）——]*[+~!#$%^&*()|}{="'`!?:<>•“”；‘‘〈〉￥……（）——｛｝【】\\/;：？《》。，、[\],]+.*)$/;
  return name_only.test(param);
};

export const validateNumberAndChar = (param: string): boolean => {
  const number_and_char = /^[A-Za-z0-9]+$/;
  return number_and_char.test(param);
};

export const validateNumberAndSpecial = (param: string): boolean => {
  const number_and_special = /^[0-9~`!@#$%^&*()\-_+=[\]{}|\\:;"'<,>.?/\s]+$/;
  return number_and_special.test(param);
};

export const validateCharAndSpecial = (param: string): boolean => {
  const char_and_special = /^[A-Za-z~`!@#$%^&*()\-_+=[\]{}|\\:;"'<,>.?/\s]+$/;
  return char_and_special.test(param);
};

export const validateNumberAndCharAndSpecial = (param: string): boolean => {
  const number_and_char_and_special = /^[A-Za-z0-9~`!@#$%^&*()\-_+=[\]{}|\\:;"'<,>.?/\s]+$/;
  return number_and_char_and_special.test(param);
};

export const validateAdminURL = (val: string) => {
  const reg = /(https|HTTPS):\/\//;
  return reg.test(val);
};

export const validateIPCIDR = (val: string) => {
  const reg =
    /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/(3[0-2]|[12]?[0-9]))?$/;
  return reg.test(val);
};
