import React from "react";
import { routeMapping } from "../layouts/routes.type";

interface IProps extends React.AllHTMLAttributes<HTMLElement> {}

export class ErrorBoundary extends React.Component<IProps, {}> {
  constructor(props: IProps) {
    super(props);
  }



  public render() {
    return this.props.children;
  }
}