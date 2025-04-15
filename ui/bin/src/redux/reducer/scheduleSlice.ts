import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ApiLoadingStatus } from "../../utils/loadingStatus";
import { createAsyncThunkWrap } from "../handler";
import {
  AcceptScheduleRequest,
  ScheduleRequest,
  ScheduleResponse,
  Service,
  UpdateResultRequest,
  UserResponse,
} from "../../api";

interface IScheduleState {
  data: ScheduleResponse[];
  doctorState: UserResponse[];
  availableSchedule: any;
  loadDataStatus: ApiLoadingStatus;
  loadCreateScheduleByDoctorStatus: ApiLoadingStatus;
  loadCreateScheduleByPatientStatus: ApiLoadingStatus;
  loadGetAvailableScheduleByDoctorId: ApiLoadingStatus;
  loadGetAvailableDoctorByScheduleTime: ApiLoadingStatus;
  loadUpdateScheduleResultStatus: ApiLoadingStatus;
  loadAcceptScheduleStatus: ApiLoadingStatus;
  loadRejectScheduleStatus: ApiLoadingStatus;
  loadDeleteScheduleStatus: ApiLoadingStatus;
  errorMessage: string | undefined;
  clickedNotificationDate: object | null;
}

const initialState: IScheduleState = {
  data: [],
  doctorState: [],
  availableSchedule: [],
  loadDataStatus: ApiLoadingStatus.None,
  loadCreateScheduleByDoctorStatus: ApiLoadingStatus.None,
  loadCreateScheduleByPatientStatus: ApiLoadingStatus.None,
  loadGetAvailableScheduleByDoctorId: ApiLoadingStatus.None,
  loadGetAvailableDoctorByScheduleTime: ApiLoadingStatus.None,
  loadUpdateScheduleResultStatus: ApiLoadingStatus.None,
  loadAcceptScheduleStatus: ApiLoadingStatus.None,
  loadRejectScheduleStatus: ApiLoadingStatus.None,
  loadDeleteScheduleStatus: ApiLoadingStatus.None,
  errorMessage: undefined,
  clickedNotificationDate: null,
};

export const getAllSchedules = createAsyncThunkWrap("/schedules", async () => {
  return await Service.scheduleService.getAllSchedules();
});

export const getScheduleByDoctorId = createAsyncThunkWrap(
  "/schedules/doctor-id",
  async () => {
    return await Service.scheduleService.getScheduleByDoctorId();
  }
);

export const getScheduleByPatientId = createAsyncThunkWrap(
  "/schedules/patient-id",
  async () => {
    return await Service.scheduleService.getScheduleByPatientId();
  }
);

export const createScheduleByDoctor = createAsyncThunkWrap(
  "/schedules/create-doctor",
  async (schedule: ScheduleRequest) => {
    return await Service.scheduleService.createScheduleByDoctor(schedule);
  }
);

export const createScheduleByPatient = createAsyncThunkWrap(
  "/schedules/create-patient",
  async (schedule: ScheduleRequest) => {
    return await Service.scheduleService.createScheduleByPatient(schedule);
  }
);

export const getAvailableScheduleByDoctorId = createAsyncThunkWrap(
  "/schedules/available-schedule",
  async (doctor_id: string) => {
    return await Service.scheduleService.getAvailableScheduleByDoctorId(
      doctor_id
    );
  }
);

export const getAvailableDoctorByScheduleTime = createAsyncThunkWrap(
  "/schedules/time/available-doctor",
  async (schedule_time: number) => {
    return await Service.scheduleService.getAvailableDoctorByScheduleTime(
      schedule_time
    );
  }
);

export const updateScheduleResult = createAsyncThunkWrap(
  "/schedules/update-result",
  async (schedule: UpdateResultRequest) => {
    return await Service.scheduleService.updateScheduleResult(schedule);
  }
);

export const acceptSchedule = createAsyncThunkWrap(
  "/schedules/accept",
  async (schedule: AcceptScheduleRequest) => {
    return await Service.scheduleService.acceptSchedule(schedule);
  }
);

export const deleteSchedule = createAsyncThunkWrap(
  "/schedules/delete",
  async (id: string) => {
    return await Service.scheduleService.deleteScheduleById(id);
  }
);

export const rejectSchedule = createAsyncThunkWrap(
  "/schedules/reject",
  async (schedule: AcceptScheduleRequest) => {
    return await Service.scheduleService.rejectSchedule(schedule);
  }
);

export const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    resetLoadDataStatus: (state) => {
      state.loadDataStatus = ApiLoadingStatus.None;
    },
    resetLoadCreateScheduleByDoctorStatus: (state) => {
      state.loadCreateScheduleByDoctorStatus = ApiLoadingStatus.None;
    },
    resetLoadCreateScheduleByPatientStatus: (state) => {
      state.loadCreateScheduleByPatientStatus = ApiLoadingStatus.None;
    },
    resetLoadGetAvailableScheduleByDoctorId: (state) => {
      state.loadGetAvailableScheduleByDoctorId = ApiLoadingStatus.None;
    },
    resetLoadGetAvailableDoctorByScheduleTime: (state) => {
      state.loadGetAvailableDoctorByScheduleTime = ApiLoadingStatus.None;
    },
    resetLoadUpdateScheduleResultStatus: (state) => {
      state.loadUpdateScheduleResultStatus = ApiLoadingStatus.None;
    },
    resetLoadAcceptScheduleStatus: (state) => {
      state.loadAcceptScheduleStatus = ApiLoadingStatus.None;
    },
    resetLoadRejectScheduleStatus: (state) => {
      state.loadAcceptScheduleStatus = ApiLoadingStatus.None;
    },
    resetLoadDeleteScheduleStatus: (state) => {
      state.loadDeleteScheduleStatus = ApiLoadingStatus.None;
    },
    setClickedNotificationDate: (
      state,
      action: PayloadAction<object | null>
    ) => {
      state.clickedNotificationDate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllSchedules.pending, (state, action) => {
        state.loadDataStatus = ApiLoadingStatus.Loading;
      })
      .addCase(getAllSchedules.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loadDataStatus = ApiLoadingStatus.Success;
      })
      .addCase(getAllSchedules.rejected, (state, action) => {
        state.data = [];
        state.errorMessage = (<any>action.payload)?.message;
        state.loadDataStatus = ApiLoadingStatus.Failed;
      })
      .addCase(getScheduleByDoctorId.pending, (state, action) => {
        state.loadDataStatus = ApiLoadingStatus.Loading;
      })
      .addCase(getScheduleByDoctorId.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loadDataStatus = ApiLoadingStatus.Success;
      })
      .addCase(getScheduleByDoctorId.rejected, (state, action) => {
        state.data = [];
        state.errorMessage = (<any>action.payload)?.message;
        state.loadDataStatus = ApiLoadingStatus.Failed;
      })
      .addCase(getScheduleByPatientId.pending, (state, action) => {
        state.loadDataStatus = ApiLoadingStatus.Loading;
      })
      .addCase(getScheduleByPatientId.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loadDataStatus = ApiLoadingStatus.Success;
      })
      .addCase(getScheduleByPatientId.rejected, (state, action) => {
        state.data = [];
        state.errorMessage = (<any>action.payload)?.message;
        state.loadDataStatus = ApiLoadingStatus.Failed;
      })
      .addCase(createScheduleByDoctor.pending, (state, action) => {
        state.loadCreateScheduleByDoctorStatus = ApiLoadingStatus.Loading;
      })
      .addCase(createScheduleByDoctor.fulfilled, (state, action) => {
        console.log(action);
        state.loadCreateScheduleByDoctorStatus = ApiLoadingStatus.Success;
      })
      .addCase(createScheduleByDoctor.rejected, (state, action) => {
        state.errorMessage = (<any>action.payload)?.message;
        state.loadCreateScheduleByDoctorStatus = ApiLoadingStatus.Failed;
      })
      .addCase(createScheduleByPatient.pending, (state, action) => {
        state.loadCreateScheduleByPatientStatus = ApiLoadingStatus.Loading;
      })
      .addCase(createScheduleByPatient.fulfilled, (state, action) => {
        state.loadCreateScheduleByPatientStatus = ApiLoadingStatus.Success;
      })
      .addCase(createScheduleByPatient.rejected, (state, action) => {
        state.errorMessage = (<any>action.payload)?.message;
        state.loadCreateScheduleByPatientStatus = ApiLoadingStatus.Failed;
      })
      .addCase(getAvailableScheduleByDoctorId.pending, (state, action) => {
        state.loadGetAvailableScheduleByDoctorId = ApiLoadingStatus.Loading;
      })
      .addCase(getAvailableScheduleByDoctorId.fulfilled, (state, action) => {
        state.availableSchedule = action.payload;
        state.loadGetAvailableScheduleByDoctorId = ApiLoadingStatus.Success;
      })
      .addCase(getAvailableScheduleByDoctorId.rejected, (state, action) => {
        state.availableSchedule = [];
        state.errorMessage = (<any>action.payload)?.message;
        state.loadGetAvailableScheduleByDoctorId = ApiLoadingStatus.Failed;
      })
      .addCase(getAvailableDoctorByScheduleTime.pending, (state, action) => {
        state.loadGetAvailableDoctorByScheduleTime = ApiLoadingStatus.Loading;
      })
      .addCase(getAvailableDoctorByScheduleTime.fulfilled, (state, action) => {
        state.doctorState = action.payload;
        state.loadGetAvailableDoctorByScheduleTime = ApiLoadingStatus.Success;
      })
      .addCase(getAvailableDoctorByScheduleTime.rejected, (state, action) => {
        state.doctorState = [];
        state.errorMessage = (<any>action.payload)?.message;
        state.loadGetAvailableDoctorByScheduleTime = ApiLoadingStatus.Failed;
      })
      .addCase(updateScheduleResult.pending, (state, action) => {
        state.loadUpdateScheduleResultStatus = ApiLoadingStatus.Loading;
      })
      .addCase(updateScheduleResult.fulfilled, (state, action) => {
        state.loadUpdateScheduleResultStatus = ApiLoadingStatus.Success;
      })
      .addCase(updateScheduleResult.rejected, (state, action) => {
        state.errorMessage = (<any>action.payload)?.message;
        state.loadUpdateScheduleResultStatus = ApiLoadingStatus.Failed;
      })
      .addCase(acceptSchedule.pending, (state, action) => {
        state.loadAcceptScheduleStatus = ApiLoadingStatus.Loading;
      })
      .addCase(acceptSchedule.fulfilled, (state, action) => {
        state.loadAcceptScheduleStatus = ApiLoadingStatus.Success;
      })
      .addCase(acceptSchedule.rejected, (state, action) => {
        state.errorMessage = (<any>action.payload)?.message;
        state.loadAcceptScheduleStatus = ApiLoadingStatus.Failed;
      })
      .addCase(rejectSchedule.pending, (state, action) => {
        state.loadRejectScheduleStatus = ApiLoadingStatus.Loading;
      })
      .addCase(rejectSchedule.fulfilled, (state, action) => {
        state.loadRejectScheduleStatus = ApiLoadingStatus.Success;
      })
      .addCase(rejectSchedule.rejected, (state, action) => {
        state.errorMessage = (<any>action.payload)?.message;
        state.loadRejectScheduleStatus = ApiLoadingStatus.Failed;
      })
      .addCase(deleteSchedule.pending, (state, action) => {
        state.loadDeleteScheduleStatus = ApiLoadingStatus.Loading;
      })
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.loadDeleteScheduleStatus = ApiLoadingStatus.Success;
      })
      .addCase(deleteSchedule.rejected, (state, action) => {
        state.errorMessage = (<any>action.payload)?.message;
        state.loadDeleteScheduleStatus = ApiLoadingStatus.Failed;
      });
  },
});

export const {
  resetLoadDataStatus,
  resetLoadUpdateScheduleResultStatus,
  resetLoadAcceptScheduleStatus,
  resetLoadRejectScheduleStatus,
  resetLoadDeleteScheduleStatus,
  resetLoadCreateScheduleByDoctorStatus,
  resetLoadCreateScheduleByPatientStatus,
  resetLoadGetAvailableScheduleByDoctorId,
  resetLoadGetAvailableDoctorByScheduleTime,
  setClickedNotificationDate,
} = scheduleSlice.actions;
export default scheduleSlice.reducer;
