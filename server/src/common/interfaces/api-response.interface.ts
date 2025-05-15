export interface ApiResponse<T = any> {
  message?: string;
  error?: string;
  statusCode: number;
  data?: T;
}
