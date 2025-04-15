import * as React from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import DataTable from "../../components/Table/dataTable";
import { DeviceDetail } from "./device.details";
import {
  updateDeviceById,
  getAssignedDevices,
  getDeviceByUserId,
  unassignDevice,
  resetLoadUnassignDeviceStatus,
} from "../../redux/reducer/deviceSlice";
import { getAllExceptAdmin, getAllUsers } from "../../redux/reducer/userSlice";
import { ApiLoadingStatus } from "../../utils/loadingStatus";
import { checkDateTypeKey, convertTimeToDateTime } from "../../utils/dateUtils";
import { findElementById, checkListTypeKey } from "../../utils/arrayUtils";
import {
  deviceType,
  convertDeviceTypeToString,
  convertStringToDeviceType,
  deviceStatus,
  convertDeviceStatusToString,
  convertStringToDeviceStatus,
  userRole,
  convertRoleToString,
} from "../../constants";
import dayjs from "dayjs";
import { Context } from "../../utils/context";
import { showNotiError, showNotiSuccess } from "../../components/notification";
import { Modal, Tag } from "antd";
import { UnassignDeviceRequest } from "../../api";

type DeviceDetailType = {
  open: (id: string) => void;
};

export const AssignedDevice: React.FC = () => {
  const dispatch = useAppDispatch();
  const dataState = useAppSelector((state) => state.device);
  const userState = useAppSelector((state) => state.user);
  const [dataTable, setDataTable] = React.useState<any[]>([]);
  const [userDropDown, setUserDropDown] = React.useState<any[]>([]);
  const [selectedData, setSelectedData] = React.useState<any[]>([]);
  const [isHidden, setIsHidden] = React.useState<boolean>(false);
  const drawerRef = React.useRef<DeviceDetailType>(null);

  const listLabel = ["detail_name", "value", "information"];

  const columns = [
    {
      title: "Tên thiết bị",
      dataIndex: "device_name",
      key: "device_name",
      type: "text",
      isEdit: true,
      searchable: true,
    },
    {
      title: "Loại thiết bị",
      dataIndex: "device_type_id",
      key: "device_type_id",
      type: "select",
      isEdit: true,
      dataSelect: deviceType,
      filters: [
        {
          text: "Đo điện tim",
          value: 1,
        },
        {
          text: "Đo chỉ số tim mạch",
          value: 2,
        },
        {
          text: "Đo âm thanh",
          value: 3,
        },
      ],
      onFilter: (value: any, record: any) =>
        record.device_type_id === convertDeviceTypeToString(value),
    },
    {
      title: "Người phụ trách",
      dataIndex: "username",
      key: "username",
      type: "select",
      isEdit: false,
      hidden: isHidden,
      searchable: true,
    },
    {
      title: "Người phụ trách",
      dataIndex: "user_id",
      key: "user_id",
      type: "select",
      isEdit: false,
      hidden: true,
      dataSelect: userDropDown.map((user) => ({
        value: user.id,
        label: user.username,
      })),
    },
    {
      title: "Trạng thái",
      dataIndex: "status_id",
      key: "status_id",
      type: "select",
      isEdit: false,
      dataSelect: deviceStatus,
      render: (status_id: any) => {
        let color =
          status_id == 1 ? "geekblue" : status_id == 2 ? "green" : "volcano";
        return (
          <Tag color={color} key={status_id}>
            {convertDeviceStatusToString(status_id)}
          </Tag>
        );
      },
      filters: [
        {
          text: "Đang được mượn",
          value: 1,
        },
        {
          text: "Đang trống",
          value: 2,
        },
        {
          text: "Đang bảo trì",
          value: 3,
        },
      ],
      onFilter: (value: any, record: any) => record.status_id === Number(value),
    },
    {
      title: "Tần số",
      dataIndex: "frequency",
      key: "frequency",
      type: "list",
      isEdit: true,
      hidden: true,
      listLabel: listLabel,
    },
    {
      title: "Phương thức kết nối",
      dataIndex: "connection",
      key: "connection",
      type: "list",
      isEdit: true,
      hidden: true,
      listLabel: listLabel,
    },
    {
      title: "Phương thức lưu trữ",
      dataIndex: "storage",
      key: "storage",
      type: "list",
      isEdit: true,
      hidden: true,
      listLabel: listLabel,
    },
    {
      title: "Thời gian bắt đầu mượn",
      dataIndex: "start_time",
      key: "start_time",
      type: "time",
      isEdit: true,
    },
    {
      title: "Hạn trả thiết bị",
      dataIndex: "end_time",
      key: "end_time",
      type: "time",
      isEdit: true,
    },
  ];

  const handleData = (data: any, type: string) => {
    let deviceData = {} as any;

    if (type === "edit-form") {
      deviceData = {
        ...data,
        status_id: convertStringToDeviceStatus(data.status_id),
        device_type_id: convertStringToDeviceType(data.device_type_id),
      };
      Object.keys(data).forEach((key) => {
        if (checkDateTypeKey(key)) {
          deviceData[key] = dayjs(data[key], "DD/MM/YYYY");
        }
        if (checkListTypeKey(key)) {
          deviceData[key] = {
            list: data[key],
          };
        }
      });
    }

    if (type === "render") {
      deviceData = {
        ...data,
        device_type_id: convertDeviceTypeToString(data.device_type_id),
      };
      Object.keys(data).forEach((key) => {
        if (checkDateTypeKey(key)) {
          deviceData[key] = convertTimeToDateTime(data[key]);
        }
      });
    }
    return deviceData;
  };

  React.useEffect(() => {
    if (Context.role === userRole.admin) {
      dispatch(getAssignedDevices());
      dispatch(getAllExceptAdmin());
      setIsHidden(false);
    }
    if (Context.role === userRole.doctor) {
      dispatch(getDeviceByUserId());
      setIsHidden(true);
    }
    if (Context.role === userRole.patient) {
      dispatch(getDeviceByUserId());
      setIsHidden(true);
    }
  }, []);

  React.useEffect(() => {
    if (userState.loadDataStatus === ApiLoadingStatus.Success) {
      setUserDropDown(userState.data);
    }
    if (
      userState.loadDataStatus === ApiLoadingStatus.Failed &&
      userState.errorMessage
    ) {
      showNotiError(userState.errorMessage);
    }
  }, [userState.loadDataStatus]);

  React.useEffect(() => {
    if (dataState.loadUnassignDeviceStatus === ApiLoadingStatus.Success) {
      showNotiSuccess("Bạn đã hủy phân công thành công");
      dispatch(getAssignedDevices());
      dispatch(resetLoadUnassignDeviceStatus());
    }
    if (
      dataState.loadUnassignDeviceStatus === ApiLoadingStatus.Failed &&
      dataState.errorMessage
    ) {
      showNotiError(dataState.errorMessage);
    }
  }, [dataState.loadUnassignDeviceStatus]);

  React.useEffect(() => {
    if (dataState.loadDataStatus === ApiLoadingStatus.Success) {
      const rawData = dataState.data.map((device) =>
        handleData(device, "render")
      );
      setDataTable(rawData);
    }
  }, [dataState.loadDataStatus]);

  const handleUnassignDevice = () => {
    if (!selectedData.length) return;

    const deviceData = findElementById(dataTable, selectedData[0]);
    if (!deviceData) return;

    Modal.confirm({
      title: "Xác nhận",
      content: "Bạn có chắc muốn hủy phân công thiết bị này không?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: () => {
        dispatch(
          unassignDevice({
            id: deviceData.id,
            user_id: null,
          } as unknown as UnassignDeviceRequest)
        );
      },
    });
  };

  return (
    <>
      <DataTable
        role={Context.role === userRole.admin ? userRole.admin : undefined}
        addButton={false}
        editButton={false}
        unassignButton={Context.role === userRole.admin}
        deleteButton={false}
        column={columns}
        name="Thông tin thiết bị"
        data={dataTable}
        loading={dataState.loadDataStatus === ApiLoadingStatus.Loading}
        unassignFunction={handleUnassignDevice}
        updateSelectedData={setSelectedData}
        handleOpenDrawer={(id) => drawerRef.current?.open(id)}
      />
      <DeviceDetail ref={drawerRef} />
    </>
  );
};
