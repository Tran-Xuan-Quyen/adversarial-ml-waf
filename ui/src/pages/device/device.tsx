import * as React from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import DataTable from "../../components/Table/dataTable";
import { ModalControlData } from "../../components/Modal/ModalControlData";
import { DeviceDetail } from "./device.details";
import {
  updateDeviceById,
  deleteDeviceById,
  resetLoadAddDataStatus,
  resetLoadUpdateDataStatus,
  resetLoadDeleteDataStatus,
  addDevice,
  deleteDeviceDetailById,
  addDeviceDetail,
  updateDeviceDetailById,
  getDeviceByUserId,
  getUnassignedDevices,
} from "../../redux/reducer/deviceSlice";
import { getAllExceptAdmin } from "../../redux/reducer/userSlice";
import { ApiLoadingStatus } from "../../utils/loadingStatus";
import { convertTimeToDate, checkDateTypeKey } from "../../utils/dateUtils";
import {
  findElementById,
  checkListTypeKey,
  checkAddedDetail,
  checkDeletedDetail,
} from "../../utils/arrayUtils";
import {
  deviceType,
  convertDeviceTypeToString,
  convertStringToDeviceType,
  deviceAvailableStatus,
  convertDeviceStatusToString,
  userRole,
  convertRoleToString,
} from "../../constants";
import dayjs from "dayjs";
import { Context } from "../../utils/context";
import { showNotiError, showNotiSuccess } from "../../components/notification";
import { Tag } from "antd";
import { ModalAssignDevice } from "../../components/Modal/ModalAssignDevice";

type DeviceDetailType = {
  open: (id: string) => void;
};

type AddEditDeviceType = {
  open: (data: any[], columns: any[], layout: any) => void;
};

type AssignDeviceType = {
  open: (data: any[]) => void;
};

export const Device: React.FC = () => {
  const dispatch = useAppDispatch();
  const dataState = useAppSelector((state) => state.device);
  const userState = useAppSelector((state) => state.user);
  const [dataTable, setDataTable] = React.useState<any[]>([]);
  const [userDropDown, setUserDropDown] = React.useState<any[]>([]);
  const [selectedData, setSelectedData] = React.useState<any[]>([]);
  const drawerRef = React.useRef<DeviceDetailType>(null);
  const modalAddRef = React.useRef<AddEditDeviceType>(null);
  const modalAssignRef = React.useRef<AssignDeviceType>(null);
  const modalUpdateRef = React.useRef<AddEditDeviceType>(null);

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
      dataIndex: "user_id",
      key: "user_id",
      type: "select",
      isEdit: false,
      hidden: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status_id",
      key: "status_id",
      type: "select",
      isEdit: true,
      dataSelect: deviceAvailableStatus,
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
      title: "Thông tin",
      dataIndex: "information",
      key: "information",
      type: "text",
      isEdit: true,
      searchable: true,
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
  ];

  const handleData = (data: any, type: string) => {
    let deviceData = {} as any;

    if (type === "edit-form") {
      deviceData = {
        ...data,
        status_id: data.status_id,
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
          deviceData[key] = convertTimeToDate(data[key]);
        }
      });
    }

    return deviceData;
  };

  const handleDetailChanges = (
    originalDetails: any[],
    updatedDetails: any[],
    deviceId: string,
    detailType: number
  ) => {
    if (originalDetails.length > updatedDetails.length) {
      const deletedDetails = checkDeletedDetail(
        originalDetails,
        updatedDetails
      );
      if (deletedDetails.length > 0) {
        deletedDetails.forEach((deleted) => {
          dispatch(deleteDeviceDetailById(deleted.id));
        });
      }
    }
    if (originalDetails.length < updatedDetails.length) {
      const addedDetails = checkAddedDetail(originalDetails, updatedDetails);
      if (addedDetails.length > 0) {
        addedDetails.forEach((added) => {
          added.detail_type = detailType;
          added.device_id = deviceId;
          dispatch(addDeviceDetail(added));
        });
      }
    } else if (
      JSON.stringify(originalDetails) !== JSON.stringify(updatedDetails)
    ) {
      updatedDetails.map((updated) =>
        dispatch(updateDeviceDetailById(updated))
      );
    }
  };

  React.useEffect(() => {
    dispatch(getUnassignedDevices());
    dispatch(getAllExceptAdmin());
  }, []);

  React.useEffect(() => {
    if (dataState.loadDataStatus === ApiLoadingStatus.Success) {
      const rawData = dataState.data.map((device) =>
        handleData(device, "render")
      );
      console.log(rawData);
      setDataTable(rawData);
    }
  }, [dataState.loadDataStatus]);

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
    if (dataState.loadAddDataStatus === ApiLoadingStatus.Success) {
      showNotiSuccess("Bạn đã thêm thiết bị thành công");
      dispatch(resetLoadAddDataStatus());
      dispatch(getUnassignedDevices());
    }
    if (
      dataState.loadAddDataStatus === ApiLoadingStatus.Failed &&
      dataState.errorMessage
    ) {
      showNotiError(dataState.errorMessage);
    }
  }, [dataState.loadAddDataStatus]);

  React.useEffect(() => {
    if (dataState.loadUpdateDataStatus === ApiLoadingStatus.Success) {
      showNotiSuccess("Bạn đã sửa thiết bị thành công");
      dispatch(resetLoadUpdateDataStatus());
      dispatch(getUnassignedDevices());
    }
    if (
      dataState.loadUpdateDataStatus === ApiLoadingStatus.Failed &&
      dataState.errorMessage
    ) {
      showNotiError(dataState.errorMessage);
    }
  }, [dataState.loadUpdateDataStatus]);

  React.useEffect(() => {
    if (dataState.loadDeleteDataStatus === ApiLoadingStatus.Success) {
      showNotiSuccess("Bạn đã xóa thiết bị thành công");
      dispatch(resetLoadDeleteDataStatus());
      dispatch(getUnassignedDevices());
    }
    if (
      dataState.loadDeleteDataStatus === ApiLoadingStatus.Failed &&
      dataState.errorMessage
    ) {
      showNotiError(dataState.errorMessage);
    }
  }, [dataState.loadDeleteDataStatus]);

  const handleSubmitAddFunction = (data: any) => {
    data.start_time = null;
    data.end_time = null;
    data.status_id = 2;

    const result = {
      ...data,
      frequency: data.frequency["list"],
      connection: data.connection["list"],
      storage: data.storage["list"],
    };

    return dispatch(addDevice(result));
  };

  const handleEditFunction = () => {
    const deviceData = findElementById(dataTable, selectedData[0]);
    const dataEdit = handleData(deviceData, "edit-form");
    modalUpdateRef.current?.open(dataEdit, columns, "vertical");
  };

  const handleSubmitEditDevice = (data: any) => {
    data.start_time = null;
    data.end_time = null;
    data.status_id ||= 2;
    const { ...payload } = data;
    const deviceData = findElementById(dataTable, selectedData[0]);

    handleDetailChanges(
      deviceData.frequency,
      payload.frequency["list"],
      deviceData.id,
      1
    );
    handleDetailChanges(
      deviceData.connection,
      payload.connection["list"],
      deviceData.id,
      2
    );
    handleDetailChanges(
      deviceData.storage,
      payload.storage["list"],
      deviceData.id,
      3
    );

    dispatch(updateDeviceById(payload));
  };

  const handleDeleteFunction = (id: string) => {
    dispatch(deleteDeviceById(id));
  };

  const initData: any = {
    device_name: "",
    device_type_id: "",
    user_id: "",
    status_id: "",
    information: "",
    frequency: {
      list: [
        {
          detail_name: "",
          value: "",
          information: "",
        },
      ],
    },
    connection: {
      list: [
        {
          detail_name: "",
          value: "",
          information: "",
        },
      ],
    },
    storage: {
      list: [
        {
          detail_name: "",
          value: "",
          information: "",
        },
      ],
    },
  };

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

  const handleAssignFunction = () => {
    const deviceData = findElementById(dataTable, selectedData[0]);
    const dataEdit = handleData(deviceData, "edit-form");
    modalAssignRef.current?.open(dataEdit);
  };

  const handleSubmitAssignDevice = (data: any) => {
    console.log(data);
    dispatch(updateDeviceById(data));
  };

  return (
    <>
      <DataTable
        role={Context.role === userRole.admin ? userRole.admin : undefined}
        addButton={Context.role === userRole.admin}
        editButton={Context.role === userRole.admin}
        assignButton
        deleteButton={Context.role === userRole.admin}
        column={columns}
        name="Thông tin thiết bị"
        data={dataTable}
        loading={dataState.loadDataStatus === ApiLoadingStatus.Loading}
        updateSelectedData={setSelectedData}
        addFunction={() =>
          modalAddRef.current?.open(initData, columns, "vertical")
        }
        editFunction={handleEditFunction}
        assignFunction={handleAssignFunction}
        deleteFunction={handleDeleteFunction}
        handleOpenDrawer={(id) => drawerRef.current?.open(id)}
      />
      <ModalControlData
        ref={modalAddRef}
        title="Thêm thiết bị mới"
        submitFunction={(data: any) => handleSubmitAddFunction(data)}
        className="add-device"
      />
      <ModalAssignDevice
        ref={modalAssignRef}
        title="Phân công thiết bị"
        userOptions={userDropDown.map((user) => ({
          value: user.id,
          label: `${convertRoleToString(user.role_id)} ${user.username}`,
        }))}
        submitFunction={(data: any) => handleSubmitAssignDevice(data)}
        className="assign-device"
      />
      <ModalControlData
        ref={modalUpdateRef}
        title="Sửa thông tin thiết bị"
        submitFunction={(data: any) => handleSubmitEditDevice(data)}
      />
      <DeviceDetail ref={drawerRef} />
    </>
  );
};
