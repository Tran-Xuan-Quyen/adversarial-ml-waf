import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserRequest, UserResponse } from "../../api/api-generated";
import { ApiLoadingStatus } from "../../utils/loadingStatus";
import { createAsyncThunkWrap, IExceptionModel } from "../handler";
import { Service } from "../../api";

interface IUserState {
  data: UserResponse[];
  doctorData: UserResponse[];
  userData: UserResponse;
  accountData: UserResponse;
  loadDataStatus: ApiLoadingStatus;
  loadDoctorDataStatus: ApiLoadingStatus;
  loadGetUserByIdStatus: ApiLoadingStatus;
  loadUpdateDataStatus: ApiLoadingStatus;
  loadDeleteDataStatus: ApiLoadingStatus;
  errorMessage: string | undefined;
}

const initialState: IUserState = {
  data: [],
  doctorData: [],
  userData: {} as UserResponse,
  accountData: {} as UserResponse,
  loadDataStatus: ApiLoadingStatus.None,
  loadDoctorDataStatus: ApiLoadingStatus.None,
  loadGetUserByIdStatus: ApiLoadingStatus.None,
  loadUpdateDataStatus: ApiLoadingStatus.None,
  loadDeleteDataStatus: ApiLoadingStatus.None,
  errorMessage: undefined,
};

export const getAllUsers = createAsyncThunkWrap("/users", async () => {
  return await Service.userService.getAllUsers();
});

export const getAllDoctors = createAsyncThunkWrap("users/doctors", async () => {
  return await Service.userService.getAllDoctors();
});

export const getAllExceptAdmin = createAsyncThunkWrap(
  "users/except-admin",
  async () => {
    return await Service.userService.getAllExceptAdmin();
  }
);

export const getAllExceptSelf = createAsyncThunkWrap(
  "users/except-self",
  async () => {
    return await Service.userService.getAllExceptSelf();
  }
);

export const getAdminAndPatientByDoctorId = createAsyncThunkWrap(
  "users/admin-patient-data",
  async () => {
    return await Service.userService.getAdminAndPatientByDoctorId();
  }
);

export const getUserById = createAsyncThunkWrap(
  "/users/id",
  async (id: string) => {
    return await Service.userService.getUserById(id);
  }
);

export const getPatientByDoctorId = createAsyncThunkWrap(
  "/users/data/patient-data",
  async () => {
    return await Service.userService.getPatientByDoctorId();
  }
);

export const getDoctorByPatientId = createAsyncThunkWrap(
  "/users/data/doctor-data",
  async () => {
    return await Service.userService.getDoctorByPatientId();
  }
);

export const updateUserById = createAsyncThunkWrap(
  "/users/update",
  async (user: UserRequest) => {
    return await Service.userService.updateUserById(user);
  }
);
export const deleteUserById = createAsyncThunkWrap(
  "/users/delete",
  async (id: string) => {
    return await Service.userService.deleteUserById(id);
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetLoadDataStatus: (state) => {
      state.loadDataStatus = ApiLoadingStatus.None;
    },
    resetLoadGetUserByIdStatus: (state) => {
      state.loadGetUserByIdStatus = ApiLoadingStatus.None;
    },
    resetLoadUpdateDataStatus: (state) => {
      state.loadUpdateDataStatus = ApiLoadingStatus.None;
    },
    resetLoadDeleteDataStatus: (state) => {
      state.loadDeleteDataStatus = ApiLoadingStatus.None;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsers.pending, (state, action) => {
        state.loadDataStatus = ApiLoadingStatus.Loading;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loadDataStatus = ApiLoadingStatus.Success;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.data = [];
        state.errorMessage = (<any>action.payload)?.message;
        state.loadDataStatus = ApiLoadingStatus.Failed;
      })
      .addCase(getAllExceptAdmin.pending, (state, action) => {
        state.loadDataStatus = ApiLoadingStatus.Loading;
      })
      .addCase(getAllExceptAdmin.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loadDataStatus = ApiLoadingStatus.Success;
      })
      .addCase(getAllExceptAdmin.rejected, (state, action) => {
        state.data = [];
        state.errorMessage = (<any>action.payload)?.message;
        state.loadDataStatus = ApiLoadingStatus.Failed;
      })
      .addCase(getAllExceptSelf.pending, (state, action) => {
        state.loadDataStatus = ApiLoadingStatus.Loading;
      })
      .addCase(getAllExceptSelf.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loadDataStatus = ApiLoadingStatus.Success;
      })
      .addCase(getAllExceptSelf.rejected, (state, action) => {
        state.data = [];
        state.errorMessage = (<any>action.payload)?.message;
        state.loadDataStatus = ApiLoadingStatus.Failed;
      })
      .addCase(getAllDoctors.pending, (state, action) => {
        state.loadDoctorDataStatus = ApiLoadingStatus.Loading;
      })
      .addCase(getAllDoctors.fulfilled, (state, action) => {
        state.doctorData = action.payload;
        state.loadDoctorDataStatus = ApiLoadingStatus.Success;
      })
      .addCase(getAllDoctors.rejected, (state, action) => {
        state.doctorData = [];
        state.errorMessage = (<any>action.payload)?.message;
        state.loadDoctorDataStatus = ApiLoadingStatus.Failed;
      })
      .addCase(getAdminAndPatientByDoctorId.pending, (state, action) => {
        state.loadDataStatus = ApiLoadingStatus.Loading;
      })
      .addCase(getAdminAndPatientByDoctorId.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loadDataStatus = ApiLoadingStatus.Success;
      })
      .addCase(getAdminAndPatientByDoctorId.rejected, (state, action) => {
        state.data = [];
        state.errorMessage = (<any>action.payload)?.message;
        state.loadDataStatus = ApiLoadingStatus.Failed;
      })
      .addCase(getPatientByDoctorId.pending, (state, action) => {
        state.loadDataStatus = ApiLoadingStatus.Loading;
      })
      .addCase(getPatientByDoctorId.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loadDataStatus = ApiLoadingStatus.Success;
      })
      .addCase(getPatientByDoctorId.rejected, (state, action) => {
        state.data = [];
        state.errorMessage = (<any>action.payload)?.message;
        state.loadDataStatus = ApiLoadingStatus.Failed;
      })
      .addCase(getDoctorByPatientId.pending, (state, action) => {
        state.loadDataStatus = ApiLoadingStatus.Loading;
      })
      .addCase(getDoctorByPatientId.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loadDataStatus = ApiLoadingStatus.Success;
      })
      .addCase(getDoctorByPatientId.rejected, (state, action) => {
        state.data = [];
        state.errorMessage = (<any>action.payload)?.message;
        state.loadDataStatus = ApiLoadingStatus.Failed;
      })
      .addCase(getUserById.pending, (state, action) => {
        state.loadGetUserByIdStatus = ApiLoadingStatus.Loading;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.userData = action.payload;
        state.loadGetUserByIdStatus = ApiLoadingStatus.Success;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.userData = {} as UserResponse;
        state.errorMessage = (<any>action.payload)?.message;
        state.loadGetUserByIdStatus = ApiLoadingStatus.Failed;
      })
      .addCase(updateUserById.pending, (state, action) => {
        state.loadUpdateDataStatus = ApiLoadingStatus.Loading;
      })
      .addCase(updateUserById.fulfilled, (state, action) => {
        state.loadUpdateDataStatus = ApiLoadingStatus.Success;
      })
      .addCase(updateUserById.rejected, (state, action) => {
        state.errorMessage = (<any>action.payload)?.message;
        state.loadUpdateDataStatus = ApiLoadingStatus.Failed;
      })
      .addCase(deleteUserById.pending, (state, action) => {
        state.loadDeleteDataStatus = ApiLoadingStatus.Loading;
      })
      .addCase(deleteUserById.fulfilled, (state, action) => {
        state.loadDeleteDataStatus = ApiLoadingStatus.Success;
      })
      .addCase(deleteUserById.rejected, (state, action) => {
        state.errorMessage = (<any>action.payload)?.message;
        state.loadDeleteDataStatus = ApiLoadingStatus.Failed;
      });
  },
});

export const {
  resetLoadDataStatus,
  resetLoadGetUserByIdStatus,
  resetLoadUpdateDataStatus,
  resetLoadDeleteDataStatus,
} = userSlice.actions;
export default userSlice.reducer;
