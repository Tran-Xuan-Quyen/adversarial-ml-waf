import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { config } from "./config";
import cors from "cors";
import { AppContext } from "./declaration";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
const app = express();
app.use(cors());
// Middleware to parse JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
const REFRESHTOKENCOOKIEKEY = "sso_refresh_token";
const EXPIREDTIMECOOKIKEY = "expired_time";
function getIndexHtml() {
  return fs
    .readFileSync(path.resolve(__dirname, "../../www/index.html"))
    .toString();
}
const SSORefreshTokenUrl = `${config.SSO_URL}/refresh-token`;

app.get("/", (req, res) => {
  var templateHtml = getIndexHtml();
  var responseHtml = templateHtml
    .replace(
      "$sso-refresh-token$",
      `http://${config.APP_HOST}:${config.APP_PORT}/refreshtoken`
    )
    .replace(
      "$sso-redirect-url$",
      `http://${config.APP_HOST}:${config.APP_PORT}/identity`
    );
  res.send(responseHtml);
});

app.get("/identity", (req: Request, res: Response) => {
  let cookies: any = getAllCookies(req);
  const expired_time = cookies[EXPIREDTIMECOOKIKEY];
  if (expired_time || expired_time < Date.now()) {
    return res.redirect("/");
  }
  return res.render("login", {
    registerurl: `${config.SSO_URL}/register`,
    ssourl: `${config.SSO_URL}/login`,
  });
});

app.post("/", async (req: Request, res: Response, next) => {
  try {
    const { access_token, refresh_token, expired_time, role } = req.body;
    const appContext: AppContext = {
      env: config.NODE_ENV,
      apiUrl: config.DEFAULT_API_URL,
      ssoUrl: `${config.SSO_URL}/login`,
      loginResult: true,
      token: access_token,
      expiredTime: expired_time,
      role: role,
      aboutUs: `http://${config.APP_HOST}:${config.APP_PORT}/about-us`
    };
    if (refresh_token) {
      const date = new Date();
      res.cookie(REFRESHTOKENCOOKIEKEY, refresh_token, {
        maxAge: date.getTime() + 5 * 24 * 60 * 60 * 1000,
        secure: true,
        sameSite: "strict",
        httpOnly: true,
      });
    }
    if (expired_time) {
      res.cookie(EXPIREDTIMECOOKIKEY, expired_time, {
        maxAge: expired_time,
        secure: true,
        sameSite: "strict",
        httpOnly: false,
      });
    }
    const templateHtml = getIndexHtml();
    var responseHtml = templateHtml.replace(
      "$context$",
      JSON.stringify(appContext) // the purpose of the second "stringify" is to escape characters to avoid XXS issue
    );
    res.send(responseHtml);
  } catch (e) {
    console.log(e);
  }
});

app.post("/refreshtoken", async (req: Request, res: Response, next) => {
  
});

app.use(
  express.static(path.resolve(__dirname, "../../www")),
  express.json({ limit: "500kb" }),
  express.urlencoded({ extended: true, limit: "500kb" }),
  express.static(path.resolve(__dirname, "../about-us"))
);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../view"));
app.post("/register", (req: Request, res: Response) => {
  res.send("register");
});
app.get("/about-us", (req: Request,res: Response) => {
res.sendFile(path.join(__dirname,"../about-us/index.html"))
})
app.get("/logout", (req: Request, res: Response) => {
  res.clearCookie(REFRESHTOKENCOOKIEKEY);
  res.clearCookie(EXPIREDTIMECOOKIKEY);
  res.redirect("/identity");
});
const getAllCookies = (req: any): any => {
  let cookies: any = {};
  const cookiesArray = req.headers.cookie?.split(";");
  cookiesArray?.forEach((cookie: any) => {
    const [key, value] = cookie.trim().split("=");
    cookies[key] = value;
  });
  return cookies;
};
app.get("/test", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express!");
});

app.use("*", (req, res) => res.redirect("/"));
// catch exception and log
app.use((err: any, req: any, res: any, next: any) => {
  if (err.stack) {
    console.log(
      `node server error. \nTime: ${new Date()} \nPlease refer to the attached message: \nError code: ${
        err.code
      } \nError message: ${err.message} \nError stack: ${err.stack} \n`
    );
    err.stack = "";
    err.message = "internal server error";
    next(err);
  } else {
    next();
  }
});
app.listen(config.APP_PORT, () => {
  console.log(
    `Server is running at http://${config.APP_HOST}:${config.APP_PORT}`
  );
});
