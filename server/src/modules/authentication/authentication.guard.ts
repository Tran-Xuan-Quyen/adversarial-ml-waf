import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { UserGuardModel } from "./dto/user.guard.model";
import { AuthenticationService } from "./authentication.service";
require("dotenv").config();

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private tokenCache: {
    [token: string]: { user: UserGuardModel; expiration: number };
  } = {};

  constructor(private readonly authService: AuthenticationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) return false;

    const cachedData = this.tokenCache[token];
    if (cachedData && cachedData.expiration > Date.now()) {
      request.user = cachedData.user;
      return true;
    }

    try {
      const decoded = this.authService.validateToken(token);
      if (decoded) {
        const user: UserGuardModel = {
          userId: decoded.userId.toString(),
          role: decoded.role,
        };

        this.tokenCache[token] = {
          user,
          expiration: decoded.exp * 1000,
        };
        
        request.user = user;
        return true;
      }
      return false;
    } catch (e) {
      console.error("Invalid token:", e);
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
