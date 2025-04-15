import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducer/userSlice";
import deviceReducer from "./reducer/deviceSlice";
import recordReducer from "./reducer/recordSlice";
import scheduleReducer from "./reducer/scheduleSlice";
import diagnosisReducer from "./reducer/diagnosisSlice";
import notificationScheduleReducer from "./reducer/notificationScheduleSlice";
import chatReducer from "./reducer/chatSlice"
import statisticReducer from "./reducer/statisticSlice";
import groupChatReducer from "./reducer/groupChatSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    device: deviceReducer,
    record: recordReducer,
    schedule: scheduleReducer,
    diagnosis: diagnosisReducer,
    notificationSchedule: notificationScheduleReducer,
    chat: chatReducer,
    statistic: statisticReducer,
    groupChat: groupChatReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
