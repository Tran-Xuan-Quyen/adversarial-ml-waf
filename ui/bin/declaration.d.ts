
export interface AppContext {
    env?: string;
    apiUrl?: string;
    clientId?: string; // identity to check concurrent login
    ssoUrl?: string;
    hostUrl?: string;
    identity?: any;
    loginResult?: boolean;
    token?: string;
    expiredTime?: Date;
    role?: string;
    supportedLanguages?: string[];
    aboutUs?: string;
  }