export class TokensResponseModel {
  accessToken: string;
  refreshToken: string;
  expiredTime?: number;
  role?: number;
}
