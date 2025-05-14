import dotenv from "dotenv";
dotenv.config();
interface IConfiguration {
  NODE_ENV: string;
  APP_HOST: string;
  APP_PORT: number;
  DEFAULT_API_URL: string;
  SSO_URL: string;
  SUPPORTED_LANGUAGES?: string[];
}
export const config: IConfiguration = {
  NODE_ENV: process.env.NODE_ENV || "development",
  APP_HOST: process.env.APP_HOST || "localhost",
  APP_PORT: Number(process.env.APP_PORT) || 3002,
  SSO_URL: process.env.SS0_URL || "http://localhost:3001",
  DEFAULT_API_URL: process.env.DEFAULT_API_URL || "",
};
