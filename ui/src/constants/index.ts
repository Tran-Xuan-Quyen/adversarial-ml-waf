export const gender = [
  {
    value: 1,
    label: "Nam",
  },
  {
    value: 2,
    label: "Nữ",
  },
];

export const convertGenderToString = (gender: number) => {
  switch (gender) {
    case 1:
      return "Nam";
    case 2:
      return "Nữ";
    default:
      return "Không xác định";
  }
};

export const convertStringToGender = (gender: string) => {
  switch (gender) {
    case "Nam":
      return 1;
    case "Nữ":
      return 2;
    default:
      return 3;
  }
};

export const userRole = {
  admin: "1",
  doctor: "2",
  patient: "3",
};

export const role = [
  {
    value: 1,
    label: "Admin",
  },
  {
    value: 2,
    label: "Bác sĩ",
  },
  {
    value: 3,
    label: "Bệnh nhân",
  },
];

export const convertRoleToString = (role: number) => {
  switch (role) {
    case 1:
      return "Admin";
    case 2:
      return "Bác sĩ";
    default:
      return "Bệnh nhân";
  }
};

export const convertStringToRole = (role: string) => {
  switch (role) {
    case "Admin":
      return 1;
    case "Doctor":
      return 2;
    default:
      return 3;
  }
};

export const userStatus = [
  {
    value: 1,
    label: "Đang hoạt động",
  },
  {
    value: 2,
    label: "Đã nghỉ",
  },
];

export const convertUserStatusToString = (status: number) => {
  switch (status) {
    case 1:
      return "Đang hoạt động";
    case 2:
      return "Đã nghỉ";
    default:
      return "Không xác định";
  }
};

export const convertStringToUserStatus = (status: string) => {
  switch (status) {
    case "Đang hoạt động":
      return 1;
    case "Đã nghỉ":
      return 2;
    default:
      return 3;
  }
};

export const deviceType = [
  {
    value: 1,
    label: "Đo điện tim",
  },
  {
    value: 2,
    label: "Đo chỉ số tim mạch",
  },
  {
    value: 3,
    label: "Đo âm thanh",
  },
];

export const convertDeviceTypeToString = (deviceType: number) => {
  switch (deviceType) {
    case 1:
      return "Đo điện tim";
    case 2:
      return "Đo chỉ số tim mạch";
    case 3:
      return "Đo âm thanh";
    default:
      return "Không xác định";
  }
};

export const convertStringToDeviceType = (deviceType: string) => {
  switch (deviceType) {
    case "Đo điện tim":
      return 1;
    case "Đo chỉ số tim mạch":
      return 2;
    case "Đo âm thanh":
      return 3;
    default:
      return 4;
  }
};

export const deviceStatus = [
  {
    value: 1,
    label: "Đang được mượn",
  },
  {
    value: 2,
    label: "Đang trống",
  },
  {
    value: 3,
    label: "Đang bảo trì",
  },
];

export const deviceAvailableStatus = [
  {
    value: 2,
    label: "Đang trống",
  },
  {
    value: 3,
    label: "Đang bảo trì",
  },
];

export const convertDeviceStatusToString = (deviceStatus: number) => {
  switch (deviceStatus) {
    case 1:
      return "Đang được mượn";
    case 2:
      return "Đang trống";
    case 3:
      return "Đang bảo trì";
    default:
      return "Không xác định";
  }
};

export const convertStringToDeviceStatus = (deviceStatus: string) => {
  switch (deviceStatus) {
    case "Đang trống":
      return 1;
    case "Đang hoạt động":
      return 2;
    case "Đang bảo trì":
      return 3;
    default:
      return 4;
  }
};

export const convertScheduleStatusToString = (status: number) => {
  switch (status) {
    case 1:
      return "Được chấp nhận";
    case 2:
      return "Chưa được chấp nhận";
    case 3:
      return "Không được chấp nhận";
    default:
      return "Không xác định";
  }
};

export const convertScheduleResultToString = (result: number) => {
  switch (result) {
    case 0:
      return "Đang chờ duyệt";
    case 1:
      return "Thành công";
    case 2:
      return "Chưa diễn ra";
    case 3:
      return "Thất bại";
    case 4:
      return "Đang diễn ra";
    case 5:
      return "Đang chờ duyệt ";
    default:
      return "Không xác định";
  }
};

export const scheduleType = [
  {
    value: 1,
    label: "Khám bệnh",
  },
  {
    value: 2,
    label: "Tư vấn thiết bị",
  },
];
