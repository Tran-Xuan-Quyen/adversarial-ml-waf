import { createSlice } from "@reduxjs/toolkit";
import { ApiLoadingStatus } from "../../utils/loadingStatus";
import { createAsyncThunkWrap } from "../handler";
import {
  NotificationRequest,
  NotificationResponse,
  Service,
  UpdateSeenStatusRequest,
} from "../../api";

interface INotificationState {
  notification: NotificationResponse[];
  loadCreateNotification: ApiLoadingStatus;
  loadGetNotificationByUserId: ApiLoadingStatus;
  loadUpdateSeenStatus: ApiLoadingStatus;
  loadDeleteNotificationStatus: ApiLoadingStatus;
  errorMessage: string | undefined;
}

const initialState: INotificationState = {
  notification: [],
  loadCreateNotification: ApiLoadingStatus.None,
  loadGetNotificationByUserId: ApiLoadingStatus.None,
  loadUpdateSeenStatus: ApiLoadingStatus.None,
  loadDeleteNotificationStatus: ApiLoadingStatus.None,
  errorMessage: undefined,
};

export const getNotificationByUserId = createAsyncThunkWrap(
  "/notifications",
  async () => {
    return await Service.notificationScheduleService.getNotificationByUserId();
  }
);

export const createNotification = createAsyncThunkWrap(
  "/notifications/create",
  async (notification: NotificationRequest) => {
    return await Service.notificationScheduleService.createNotification(
      notification
    );
  }
);

export const updateSeenStatus = createAsyncThunkWrap(
  "/notifications/update-seen",
  async (notification: UpdateSeenStatusRequest) => {
    return await Service.notificationScheduleService.updateSeenStatus(
      notification
    );
  }
);

export const deleteNotification = createAsyncThunkWrap(
  "/notifications/delete",
  async (id: string) => {
    return await Service.notificationScheduleService.deleteNotification(id);
  }
);

export const notificationScheduleSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    resetLoadCreateNotification: (state) => {
      state.loadCreateNotification = ApiLoadingStatus.None;
    },
    resetLoadGetNotificationByUserId: (state) => {
      state.loadGetNotificationByUserId = ApiLoadingStatus.None;
    },
    resetLoadUpdateSeenStatus: (state) => {
      state.loadUpdateSeenStatus = ApiLoadingStatus.None;
    },
    resetLoadDeleteNotification: (state) => {
      state.loadDeleteNotificationStatus = ApiLoadingStatus.None;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNotificationByUserId.pending, (state, action) => {
        state.loadGetNotificationByUserId = ApiLoadingStatus.Loading;
      })
      .addCase(getNotificationByUserId.fulfilled, (state, action) => {
        state.notification = action.payload;
        state.loadGetNotificationByUserId = ApiLoadingStatus.Success;
      })
      .addCase(getNotificationByUserId.rejected, (state, action) => {
        state.notification = [];
        state.errorMessage = (<any>action.payload)?.message;
        state.loadGetNotificationByUserId = ApiLoadingStatus.Failed;
      })
      .addCase(createNotification.pending, (state, action) => {
        state.loadCreateNotification = ApiLoadingStatus.Loading;
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.loadCreateNotification = ApiLoadingStatus.Success;
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.errorMessage = (<any>action.payload)?.message;
        state.loadCreateNotification = ApiLoadingStatus.Failed;
      })
      .addCase(updateSeenStatus.pending, (state, action) => {
        state.loadUpdateSeenStatus = ApiLoadingStatus.Loading;
      })
      .addCase(updateSeenStatus.fulfilled, (state, action) => {
        state.loadUpdateSeenStatus = ApiLoadingStatus.Success;
      })
      .addCase(updateSeenStatus.rejected, (state, action) => {
        state.errorMessage = (<any>action.payload)?.message;
        state.loadUpdateSeenStatus = ApiLoadingStatus.Failed;
      })
      .addCase(deleteNotification.pending, (state, action) => {
        state.loadDeleteNotificationStatus = ApiLoadingStatus.Loading;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loadDeleteNotificationStatus = ApiLoadingStatus.Success;
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.errorMessage = (<any>action.payload)?.message;
        state.loadDeleteNotificationStatus = ApiLoadingStatus.Failed;
      });
  },
});

export const {
  resetLoadCreateNotification,
  resetLoadGetNotificationByUserId,
  resetLoadUpdateSeenStatus,
  resetLoadDeleteNotification,
} = notificationScheduleSlice.actions;
export default notificationScheduleSlice.reducer;
