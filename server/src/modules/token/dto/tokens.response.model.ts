export class TokensResponseModel {
  access_token: string;
  refresh_token: string;
  expired_time?: number;
  role?: number;
}
