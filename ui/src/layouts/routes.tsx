import * as React from "react";
import { Navigate, Route, Routes as ReactRouterRoutes } from "react-router-dom";
import { Home } from "../pages/home";
import { Detail } from "../pages/account";
import { getRoutesByRole } from "./routes.type";
import { Context } from "../utils/context";
interface IProps {}

export const Routes = (props: IProps) => {
  const isConsentBackUrl = () => {
    // const params = ["code=", "id_token=", "error="];
    // const checkSearch =
    //   location.search.startsWith("?") && params.some((i) => location.search.includes(i));
    // const checkHash =
    //   location.hash.startsWith("#") && params.some((i) => location.hash.includes(i));
    // return checkHash || checkSearch;
    return false;
  };

  return (
    <ReactRouterRoutes>
      <Route path="/error" />
      <Route path="/home" element={<Home />} />
      <Route path="/account" element={<Detail />} />
      {Object.values(getRoutesByRole(Context.role)).map((route: any) => (
        <Route
          key={route.key}
          path={route.url}
          element={route.component ? <route.component /> : null}
        />
      ))}
      {!isConsentBackUrl() && (
        <Route path="*" element={<Navigate to={"/home"} />} />
      )}
    </ReactRouterRoutes>
  );
};
