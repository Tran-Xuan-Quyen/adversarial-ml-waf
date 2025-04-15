import * as React from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import DataTable from "../../components/Table/dataTable";
import { ModalControlData } from "../../components/Modal/ModalControlData";
import { UserDetail } from "./user.details";
import {
  getAllUsers,
  updateUserById,
  deleteUserById,
  resetLoadUpdateDataStatus,
  resetLoadDeleteDataStatus,
  getPatientByDoctorId,
  getDoctorByPatientId,
  getAllDoctors,
} from "../../redux/reducer/userSlice";
import { ApiLoadingStatus } from "../../utils/loadingStatus";
import { findElementById } from "../../utils/arrayUtils";
import { convertTimeToDate, checkDateTypeKey } from "../../utils/dateUtils";
import {
  gender,
  convertGenderToString,
  convertStringToGender,
  role,
  convertRoleToString,
  convertStringToRole,
  userStatus,
  convertUserStatusToString,
  convertStringToUserStatus,
  userRole,
} from "../../constants";
import dayjs from "dayjs";
import { Context } from "../../utils/context";
import { showNotiError, showNotiSuccess } from "../../components/notification";
import { Tag } from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import type { InputRef, TableColumnsType, TableColumnType } from "antd";

type UserDetailType = {
  open: (id: string) => void;
};

type EditUserType = {
  open: (data: any[], columns: any[], layout: any) => void;
};

export const User: React.FC = () => {
  const dispatch = useAppDispatch();
  const dataState = useAppSelector((state) => state.user);
  const [dataTable, setDataTable] = React.useState<any[]>([]);
  const [selectedData, setSelectedData] = React.useState<any[]>([]);
  const drawerRef = React.useRef<UserDetailType>(null);
  const modalUpdateRef = React.useRef<EditUserType>(null);

  const [searchText, setSearchText] = React.useState("");
  const [searchedColumn, setSearchedColumn] = React.useState("");
  const searchInput = React.useRef<InputRef>(null);

  const columns = [
    {
      title: "Tên người dùng",
      dataIndex: "username",
      key: "username",
      type: "text",
      isEdit: true,
      searchable: true,
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      type: "select",
      dataSelect: gender,
      isEdit: true,
      filters: [
        {
          text: "Nam",
          value: 1,
        },
        {
          text: "Nữ",
          value: 2,
        },
      ],
      onFilter: (value: any, record: any) =>
        record.gender === convertGenderToString(value),
    },
    {
      title: "Ngày sinh",
      dataIndex: "birth",
      key: "birth",
      type: "date",
      isEdit: true,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone_number",
      key: "phone_number",
      type: "text",
      isEdit: true,
      searchable: true,
    },
    {
      title: "Chức vụ",
      dataIndex: "role_id",
      key: "role_id",
      type: "select",
      dataSelect: role,
      isEdit: true,
      filters:
        Context.role === userRole.admin
          ? [
              {
                text: "Admin",
                value: 1,
              },
              {
                text: "Bác sĩ",
                value: 2,
              },
              {
                text: "Bệnh nhân",
                value: 3,
              },
            ]
          : undefined,
      onFilter: (value: any, record: any) =>
        record.role_id === convertRoleToString(value),
    },
    {
      title: "Trạng thái",
      dataIndex: "status_id",
      key: "status_id",
      type: "select",
      isEdit: true,
      dataSelect: userStatus,
      render: (status_id: any) => {
        let color = status_id == 1 ? "green" : "volcano";
        return (
          <Tag color={color} key={status_id}>
            {convertUserStatusToString(status_id)}
          </Tag>
        );
      },
      filters: [
        {
          text: "Đang hoạt động",
          value: 1,
        },
        {
          text: "Đã nghỉ",
          value: 2,
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
      hidden: true,
      searchable: true,
    },
  ];

  const handleData = (data: any, type: string) => {
    let userData = {} as any;

    if (type === "edit-form") {
      userData = {
        ...data,
        gender: convertStringToGender(data.gender),
        role_id: convertStringToRole(data.role_id),
        status_id: data.status_id,
      };
      Object.keys(data).forEach((key) => {
        if (checkDateTypeKey(key)) {
          userData[key] = dayjs(data[key], "DD/MM/YYYY");
        }
      });
    }

    if (type === "render") {
      userData = {
        ...data,
        gender: convertGenderToString(data.gender),
        role_id: convertRoleToString(data.role_id),
      };
      Object.keys(data).forEach((key) => {
        if (checkDateTypeKey(key)) {
          userData[key] = convertTimeToDate(data[key]);
        }
      });
    }

    return userData;
  };

  React.useEffect(() => {
    if (Context.role === userRole.admin) {
      dispatch(getAllUsers());
    }
    if (Context.role === userRole.doctor) {
      dispatch(getPatientByDoctorId());
    }
    if (Context.role === userRole.patient) {
      dispatch(getAllDoctors());
    }
  }, []);

  React.useEffect(() => {
    if (dataState.loadDataStatus === ApiLoadingStatus.Success) {
      const rawData = dataState.data;
      const data = rawData.map((element) => handleData(element, "render"));
      setDataTable(data);
    }
    if (
      dataState.loadDataStatus === ApiLoadingStatus.Failed &&
      dataState.errorMessage
    ) {
      showNotiError(dataState.errorMessage);
    }
  }, [dataState.loadDataStatus]);

  React.useEffect(() => {
    if (dataState.loadDoctorDataStatus === ApiLoadingStatus.Success) {
      const rawData = dataState.doctorData;
      const data = rawData.map((element) => handleData(element, "render"));
      setDataTable(data);
    }
  }, [dataState.loadDoctorDataStatus]);

  React.useEffect(() => {
    if (dataState.loadUpdateDataStatus === ApiLoadingStatus.Success) {
      showNotiSuccess("Bạn đã sửa thông tin người dùng thành công");
      dispatch(resetLoadUpdateDataStatus());
      dispatch(getAllUsers());
    }
    if (
      dataState.loadUpdateDataStatus === ApiLoadingStatus.Failed &&
      dataState.errorMessage
    ) {
      showNotiError(dataState.errorMessage);
      dispatch(resetLoadUpdateDataStatus());
    }
  }, [dataState.loadUpdateDataStatus]);

  React.useEffect(() => {
    if (dataState.loadDeleteDataStatus === ApiLoadingStatus.Success) {
      showNotiSuccess("Bạn đã xóa người dùng thành công");
      dispatch(resetLoadDeleteDataStatus());
      dispatch(getAllUsers());
    }
    if (
      dataState.loadDeleteDataStatus === ApiLoadingStatus.Failed &&
      dataState.errorMessage
    ) {
      showNotiError(dataState.errorMessage);
      dispatch(resetLoadDeleteDataStatus());
    }
  }, [dataState.loadDeleteDataStatus]);

  const handleEditFunction = () => {
    const userData = findElementById(dataTable, selectedData[0]);
    const dataEdit = handleData(userData, "edit-form");
    console.log(dataEdit)
    modalUpdateRef.current?.open(dataEdit, columns, "vertical");
  };

  const handleSubmitEditUser = (data: any) => {
    const { account_id, ...payload } = data || {};
    return dispatch(updateUserById(payload));
  };

  const handleDeleteFunction = (id: string) => {
    dispatch(deleteUserById(id));
  };

  return (
    <>
      <DataTable
        role={Context.role === userRole.admin ? userRole.admin : undefined}
        editButton={Context.role === userRole.admin}
        deleteButton={Context.role === userRole.admin}
        column={columns}
        name={
          Context.role === userRole.patient
            ? "Thông tin bác sĩ"
            : Context.role === userRole.admin
            ? "Thông tin người dùng"
            : "Thông tin bệnh nhân"
        }
        data={dataTable}
        loading={dataState.loadDataStatus === ApiLoadingStatus.Loading}
        updateSelectedData={setSelectedData}
        editFunction={handleEditFunction}
        deleteFunction={handleDeleteFunction}
        handleOpenDrawer={(id) => drawerRef.current?.open(id)}
      />
      <ModalControlData
        ref={modalUpdateRef}
        title="Thông tin người dùng"
        submitFunction={(data: any) => handleSubmitEditUser(data)}
      />
      <UserDetail ref={drawerRef} />
    </>
  );
};
