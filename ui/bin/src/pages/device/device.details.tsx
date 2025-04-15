import * as React from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { DrawerSide } from "../../components/Drawer/Drawer";
import {
  getDeviceById,
  resetLoadAddDetailDataStatus,
  resetLoadDeleteDetailDataStatus,
  resetLoadGetDeviceByIdStatus,
} from "../../redux/reducer/deviceSlice";
import { ApiLoadingStatus } from "../../utils/loadingStatus";
import { DesktopOutlined } from "@ant-design/icons";
import { Avatar, Divider, Table } from "antd";
import { useTranslation } from "react-i18next";
import { convertTimeToDate } from "../../utils/dateUtils";
import {
  convertDeviceTypeToString,
  convertDeviceStatusToString,
} from "../../constants";
import { showNotiError } from "../../components/notification";

const DeviceDetailComponent = (props: any, ref: any) => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [data, setData] = React.useState<any>([]);
  const [idSelect, setIdSelect] = React.useState<string>("");
  const { t } = useTranslation();
  const dataState = useAppSelector((state) => state.device);

  React.useImperativeHandle(ref, () => ({
    open: (id: string) => {
      setIsOpen(true);
      if (id !== idSelect) {
        setIdSelect(id);
        dispatch(getDeviceById(id));
      }
    },
  }));

  React.useEffect(() => {
    dispatch(getDeviceById(idSelect));
  }, [dataState.loadUpdateDataStatus]);

  React.useEffect(() => {
    if (dataState.loadAddDetailDataStatus === ApiLoadingStatus.Success) {
      dispatch(resetLoadAddDetailDataStatus());
      dispatch(getDeviceById(idSelect));
    }
  }, [dataState.loadAddDetailDataStatus]);

  React.useEffect(() => {
    if (dataState.loadDeleteDetailDataStatus === ApiLoadingStatus.Success) {
      dispatch(resetLoadDeleteDetailDataStatus());
      dispatch(getDeviceById(idSelect));
    }
  }, [dataState.loadDeleteDetailDataStatus]);

  React.useEffect(() => {
    if (dataState.loadGetDeviceByIdStatus === ApiLoadingStatus.Success) {
      const rawData = {
        ...dataState.deviceData,
        device_type_id: convertDeviceTypeToString(
          dataState.deviceData.device_type_id
        ),
        status_id: convertDeviceStatusToString(dataState.deviceData.status_id),
        start_time: convertTimeToDate(dataState.deviceData.start_time),
        end_time: convertTimeToDate(dataState.deviceData.end_time),
      };
      setData(rawData);
    }
    if (
      dataState.loadGetDeviceByIdStatus === ApiLoadingStatus.Failed &&
      dataState.errorMessage
    ) {
      showNotiError(dataState.errorMessage);
    }
  }, [dataState.loadGetDeviceByIdStatus]);

  const labelsInfo = {
    device_name: "Tên thiết bị",
    device_type_id: "Loại thiết bị",
    status_id: "Trạng thái",
    start_time:
      data.status_id === convertDeviceStatusToString(1)
        ? "Thời gian bắt đầu mượn"
        : "",
    end_time:
      data.status_id === convertDeviceStatusToString(1)
        ? "Hạn trả thiết bị"
        : "",
    frequency: "Tần số",
    connection: "Phương thức kết nối",
    storage: "Phương thức lưu trữ dữ liệu",
  };

  const customData = (
    <>
      <Avatar size={60} icon={<DesktopOutlined />} />
      <p className="site-description-item-profile-p">Thông tin cụ thể</p>
      <p className="site-description-item-profile-wrapper">
        {data.information}
      </p>
      <Divider />
    </>
  );

  const frequencyColumns = [
    {
      title: "Loại tín hiệu",
      dataIndex: "detail_name",
      key: "detail_name",
    },
    {
      title: "Tần số lấy mẫu (Hz)",
      dataIndex: "value",
      key: "value",
    },
    {
      title: "Thông tin chi tiết",
      dataIndex: "information",
      key: "information",
    },
  ];

  const storageColumns = [
    {
      title: "Loại lưu trữ",
      dataIndex: "detail_name",
      key: "detail_name",
    },
    {
      title: "Dung lượng (MB)",
      dataIndex: "value",
      key: "value",
    },
    {
      title: "Thông tin chi tiết",
      dataIndex: "information",
      key: "information",
    },
  ];

  const connectionColumns = [
    {
      title: "Loại kết nối",
      dataIndex: "detail_name",
      key: "detail_name",
    },
    {
      title: "Độ trễ",
      dataIndex: "value",
      key: "value",
    },
    {
      title: "Thông tin chi tiết",
      dataIndex: "information",
      key: "information",
    },
  ];
  const customDetail = {
    frequency: (
      <Table
        columns={frequencyColumns}
        dataSource={data.frequency}
        pagination={false}
      />
    ),
    storage: (
      <Table
        columns={storageColumns}
        dataSource={data.storage}
        pagination={false}
      />
    ),
    connection: (
      <Table
        columns={connectionColumns}
        dataSource={data.connection}
        pagination={false}
      />
    ),
  };

  return (
    <>
      <DrawerSide
        closed={() => setIsOpen(false)}
        isOpen={isOpen}
        title="Thông tin chi tiết thiết bị"
        data={data}
        labels={labelsInfo}
        customData={customData}
        customDetail={customDetail}
      />
    </>
  );
};

export const DeviceDetail = React.forwardRef(DeviceDetailComponent);
