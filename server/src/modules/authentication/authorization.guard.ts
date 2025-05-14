import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import axios from "axios";
import { Reflector } from "@nestjs/core";
require("dotenv").config();
import { AuthenticationService } from "./authentication.service";

@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(private reflector: Reflector,
        private authenticationService: AuthenticationService
    ) { }

    async canActivate(context: ExecutionContext) {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles) return true;

        try {
            const request = context.switchToHttp().getRequest();
            const token = this.extractToken(request) || '';
            const authenResponse = this.authenticationService.validateToken(token);
            if (authenResponse) {
                const user = authenResponse;
                const role = user.role.toString(); // Convert number to string
                if (roles.includes(role)) return true;
            }
            return false;
        }
        catch (err) {
            console.error(err);
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