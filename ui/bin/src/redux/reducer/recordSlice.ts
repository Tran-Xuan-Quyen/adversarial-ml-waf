import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RecordRequest, RecordResponse } from "../../api/api-generated";
import { ApiLoadingStatus } from "../../utils/loadingStatus";
import { createAsyncThunkWrap } from "../handler";
import { Service } from "../../api";

interface IRecordState {
  data: RecordResponse[];
  recordData: RecordResponse;
  samples: number;
  loadDataStatus: ApiLoadingStatus;
  loadGetRecordByIdStatus: ApiLoadingStatus;
  loadUpdateDataStatus: ApiLoadingStatus;
  loadDeleteDataStatus: ApiLoadingStatus;
  errorMessage: string | undefined;
}

const initialState: IRecordState = {
  data: [],
  recordData: {} as RecordResponse,
  samples: 100,
  loadDataStatus: ApiLoadingStatus.None,
  loadGetRecordByIdStatus: ApiLoadingStatus.None,
  loadUpdateDataStatus: ApiLoadingStatus.None,
  loadDeleteDataStatus: ApiLoadingStatus.None,
  errorMessage: undefined,
};

export const getAllRecord = createAsyncThunkWrap("/records", async () => {
  return await Service.recordService.getAllRecord();
});

export const getRecordById = createAsyncThunkWrap(
  "/record/id",
  async (id: string) => {
    return await Service.recordService.getRecordById(id);
  }
);

export const getRecordByDoctorId = createAsyncThunkWrap(
  "/records/data/doctor-id",
  async () => {
    return await Service.recordService.getRecordByDoctorId();
  }
);

export const getRecordByPatientId = createAsyncThunkWrap(
  "/records/data/patient-id",
  async () => {
    return await Service.recordService.getRecordByPatientId();
  }
);

export const updateRecordById = createAsyncThunkWrap(
  "/records/update",
  async (record: RecordRequest) => {
    return await Service.recordService.updateRecordById(record);
  }
);

export const deleteRecordById = createAsyncThunkWrap(
  "/records/delete",
  async (id: string) => {
    return await Service.recordService.deleteRecordById(id);
  }
);

export const recordSlice = createSlice({
  name: "record",
  initialState,
  reducers: {
    resetLoadDataStatus: (state) => {
      state.loadDataStatus = ApiLoadingStatus.None;
    },
    resetLoadGetRecordByIdStatus: (state) => {
      state.loadGetRecordByIdStatus = ApiLoadingStatus.None;
    },
    resetLoadUpdateDataStatus: (state) => {
      state.loadUpdateDataStatus = ApiLoadingStatus.None;
    },
    resetLoadDeleteDataStatus: (state) => {
      state.loadDeleteDataStatus = ApiLoadingStatus.None;
    },
    setSamples: (state, action: PayloadAction<number>) => {
      state.samples = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllRecord.pending, (state, action) => {
        state.loadDataStatus = ApiLoadingStatus.Loading;
      })
      .addCase(getAllRecord.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loadDataStatus = ApiLoadingStatus.Success;
      })
      .addCase(getAllRecord.rejected, (state, action) => {
        state.data = [];
        state.errorMessage = (<any>action.payload)?.message;
        state.loadDataStatus = ApiLoadingStatus.Failed;
      })
      .addCase(getRecordByDoctorId.pending, (state, action) => {
        state.loadDataStatus = ApiLoadingStatus.Loading;
      })
      .addCase(getRecordByDoctorId.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loadDataStatus = ApiLoadingStatus.Success;
      })
      .addCase(getRecordByDoctorId.rejected, (state, action) => {
        state.data = [];
        state.errorMessage = (<any>action.payload)?.message;
        state.loadDataStatus = ApiLoadingStatus.Failed;
      })
      .addCase(getRecordByPatientId.pending, (state, action) => {
        state.loadDataStatus = ApiLoadingStatus.Loading;
      })
      .addCase(getRecordByPatientId.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loadDataStatus = ApiLoadingStatus.Success;
      })
      .addCase(getRecordByPatientId.rejected, (state, action) => {
        state.data = [];
        state.errorMessage = (<any>action.payload)?.message;
        state.loadDataStatus = ApiLoadingStatus.Failed;
      })
      .addCase(getRecordById.pending, (state, action) => {
        state.loadGetRecordByIdStatus = ApiLoadingStatus.Loading;
      })
      .addCase(getRecordById.fulfilled, (state, action) => {
        state.recordData = action.payload;
        state.loadGetRecordByIdStatus = ApiLoadingStatus.Success;
      })
      .addCase(getRecordById.rejected, (state, action) => {
        state.recordData = {} as RecordResponse;
        state.errorMessage = (<any>action.payload)?.message;
        state.loadGetRecordByIdStatus = ApiLoadingStatus.Failed;
      })
      .addCase(updateRecordById.pending, (state, action) => {
        state.loadUpdateDataStatus = ApiLoadingStatus.Loading;
      })
      .addCase(updateRecordById.fulfilled, (state, action) => {
        state.loadUpdateDataStatus = ApiLoadingStatus.Success;
      })
      .addCase(updateRecordById.rejected, (state, action) => {
        state.errorMessage = (<any>action.payload)?.message;
        state.loadUpdateDataStatus = ApiLoadingStatus.Failed;
      })
      .addCase(deleteRecordById.pending, (state, action) => {
        state.loadDeleteDataStatus = ApiLoadingStatus.Loading;
      })
      .addCase(deleteRecordById.fulfilled, (state, action) => {
        state.loadDeleteDataStatus = ApiLoadingStatus.Success;
      })
      .addCase(deleteRecordById.rejected, (state, action) => {
        state.errorMessage = (<any>action.payload)?.message;
        state.loadDeleteDataStatus = ApiLoadingStatus.Failed;
      });
  },
});

export const {
  resetLoadDataStatus,
  resetLoadGetRecordByIdStatus,
  resetLoadUpdateDataStatus,
  resetLoadDeleteDataStatus,
  setSamples,
} = recordSlice.actions;
export default recordSlice.reducer;
