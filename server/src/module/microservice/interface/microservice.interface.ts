export interface IMicroserviceService {
  getCommonPublicKey: () => string;
  register: () => string;
  getPublicKeyByServiceName: () => string;
}
