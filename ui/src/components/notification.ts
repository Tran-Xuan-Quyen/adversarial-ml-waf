import React from "react";
import { Button, notification, Space } from "antd";

export const showNotiSuccess = (descript: string) => {
  notification.success({
    message: "Thành công",
    description: descript,
    placement: "topRight",
  });
};

export const showNotiInfo = (descript: string) => {
  notification.info({
    message: "Thông tin",
    description: descript,
    placement: "topRight",
  });
};

export const showNotiError = (descript: string) => {
  notification.error({
    message: "Error",
    description: descript,
    placement: "topRight",
  });
};

export const showNotiWarning = (descript: string) => {
  notification.warning({
    message: "Cảnh báo",
    description: descript,
    placement: "topRight",
  });
};
