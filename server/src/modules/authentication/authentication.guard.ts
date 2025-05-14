import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { UserGuardModel } from "./dto/user.guard.model";
import axios from "axios";
require("dotenv").config();

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private tokenCache: {
    [token: string]: { user: UserGuardModel; expiration: number };
  } = {};
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) return false;
    const cachedData = this.tokenCache[token];
    if (cachedData && cachedData.expiration > Date.now()) {
      request.user = cachedData.user; // Gán thông tin user từ cache
      return true;
    }
    try {
      const response = await axios.post(`${process.env.SSO_URL}/auth/decode`, {
        token: token,
      });
      if (response.data && response.status === 200) {
        const expiredTime = response.data?.exp * 1000;
        const accountId = response.data?.accountId;
        const role = response.data?.role;

        const user: UserGuardModel = {
          accountId: accountId,
          role: role,
        };

        this.tokenCache[token] = {
          user: { accountId: accountId, role: role },
          expiration: expiredTime,
        };
        request.user = user;
        return true;
      }

      return false;
    } catch (e) {
      console.error("invalid token:", e);
      return false;
    }
  }
  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    return authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
  }
}
