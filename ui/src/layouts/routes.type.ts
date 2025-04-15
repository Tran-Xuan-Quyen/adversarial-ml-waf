import * as React from "react";
import { User } from "../pages/user";
import { Device } from "../pages/device";
import { Record } from "../pages/record";
import { Schedule } from "../pages/schedule";
import { ChatMes } from "../pages/chat";
import {
  TeamOutlined,
  DesktopOutlined,
  LineChartOutlined,
  ScheduleOutlined,
  UserOutlined,
  WechatWorkOutlined,
  TagOutlined
} from "@ant-design/icons";
import { userRole } from "../constants";
import { AssignedDevice } from "../pages/assignedDevice";

export interface IRouteItem {
  key: string;
  i18nKey?: string;
  url: string;
  label?: string;
  component?: React.FC<{}>;
  icon?: any;
  parentKeys?: string[];
  specificBeadTextKey?: string;
}

export const getPage = () => {
  return "Page";
};

export const adminRouterMappingGroup: { [key: string]: IRouteItem } = {
  User: {
    key: "/user",
    url: "/user",
    label: "Thông tin người dùng",
    component: User,
    icon: TeamOutlined,
  },
  Device: {
    key: "/device",
    url: "/device",
    label: "Thông tin thiết bị",
    component: Device,
    icon: DesktopOutlined,
  },
  AssignedDevice: {
    key: "/assigned-device",
    url: "/assigned-device",
    label: "Phân công thiết bị",
    component: AssignedDevice,
    icon: TagOutlined,
  },
  Record: {
    key: "/record",
    url: "/record",
    label: "Thông tin bản ghi",
    component: Record,
    icon: LineChartOutlined,
  },
  Schedule: {
    key: "/schedule",
    url: "/schedule",
    label: "Thông tin lịch khám",
    component: Schedule,
    icon: ScheduleOutlined,
  },
  Chat: {
    key: "/chat",
    url: "/chat",
    label: "Tin nhắn",
    component: ChatMes,
    icon: WechatWorkOutlined
  }
};

export const doctorRouterMappingGroup: { [key: string]: IRouteItem } = {
  User: {
    key: "/user",
    url: "/user",
    label: "Thông tin bệnh nhân",
    component: User,
    icon: TeamOutlined,
  },
  AssignedDevice: {
    key: "/assigned-device",
    url: "/assigned-device",
    label: "Phân công thiết bị",
    component: AssignedDevice,
    icon: TagOutlined,
  },
  Record: {
    key: "/record",
    url: "/record",
    label: "Thông tin bản ghi",
    component: Record,
    icon: LineChartOutlined,
  },
  Schedule: {
    key: "/schedule",
    url: "/schedule",
    label: "Thông tin lịch khám",
    component: Schedule,
    icon: ScheduleOutlined,
  },
  Chat: {
    key: "/chat",
    url: "/chat",
    label: "Tin nhắn",
    component: ChatMes,
    icon: WechatWorkOutlined
  }
};

export const patientRouterMappingGroup: { [key: string]: IRouteItem } = {
  DoctorInformation: {
    key: "/doctor",
    url: "/doctor",
    label: "Thông tin bác sĩ",
    component: User,
    icon: UserOutlined,
  },
  AssignedDevice: {
    key: "/assigned-device",
    url: "/assigned-device",
    label: "Phân công thiết bị",
    component: AssignedDevice,
    icon: TagOutlined,
  },
  RecordInformation: {
    key: "/record",
    url: "/record",
    label: "Thông tin bản ghi",
    component: Record,
    icon: LineChartOutlined,
  },
  Schedule: {
    key: "/schedule",
    url: "/schedule",
    label: "Thông tin lịch khám",
    component: Schedule,
    icon: ScheduleOutlined,
  },
  Chat: {
    key: "/chat",
    url: "/chat",
    label: "Tin nhắn",
    component: ChatMes,
    icon: WechatWorkOutlined
  }
};

export const getRoutesByRole = (role: string) => {
  switch (role) {
    case userRole.admin:
      return Object.values(adminRouterMappingGroup);
    case userRole.doctor:
      return Object.values(doctorRouterMappingGroup);
    case userRole.patient:
      return Object.values(patientRouterMappingGroup);
    default:
      return {};
  }
};

export const routeMapping = {
  Login: {
    key: "/login",
    url: "/login",
  },
  LoginFailed: {
    key: "/login-failed",
    url: "/login-failed",
  },
  ErrorPage: {
    key: "/error",
    url: "/error",
  },
} as { [key: string]: IRouteItem };

export const getRouteItemByKey = (routeKey: string) => {
  let currentRouteItem = routeMapping.Home;
  for (const key in routeMapping) {
    const item = routeMapping[key];
    if (item.key === routeKey) {
      currentRouteItem = item;
    }
  }
  return currentRouteItem;
};

export const getRouteItemByUrl = (url: string) => {
  let currentRouteItem = routeMapping.Home;
  for (const key in routeMapping) {
    const item = routeMapping[key];
    if (item.url === url) {
      currentRouteItem = item;
    }
  }
  return currentRouteItem;
};
