import { createSlice } from "@reduxjs/toolkit";
import { ApiLoadingStatus } from "../../utils/loadingStatus";
import { createAsyncThunkWrap } from "../handler";
import {
  Service,
  GroupChatRequest,
  GroupChatSchema,
  GroupMemberResponse,
} from "../../api";

interface IGroupChatState {
  data: GroupChatSchema[];
  member: GroupMemberResponse[];
  loadCreateGroupChat: ApiLoadingStatus;
  loadGetGroupChat: ApiLoadingStatus;
  loadGetMemberByGroupChatId: ApiLoadingStatus;
}

const initialState: IGroupChatState = {
  data: [],
  member: [],
  loadCreateGroupChat: ApiLoadingStatus.None,
  loadGetGroupChat: ApiLoadingStatus.None,
  loadGetMemberByGroupChatId: ApiLoadingStatus.None,
};

export const createGroupChat = createAsyncThunkWrap(
  "/groupChat",
  async (groupChatRequest: GroupChatRequest) => {
    return await Service.groupChatService.createGroupChat(groupChatRequest);
  }
);

export const getGroupChat = createAsyncThunkWrap(
  "/groupChat/get",
  async (id: string) => {
    return await Service.groupChatService.getGroupChat(id);
  }
);

export const getMemberByGroupChatId = createAsyncThunkWrap(
  "/groupChat/member/group-id",
  async (id: string) => {
    return await Service.groupChatService.getMemberByGroupChatId(id);
  }
);

export const groupChatSlice = createSlice({
  name: "groupChat",
  initialState,
  reducers: {
    resetLoadCreateGroupChat: (state) => {
      state.loadCreateGroupChat = ApiLoadingStatus.None;
    },
    resetLoadGetGroupChat: (state) => {
      state.loadGetGroupChat = ApiLoadingStatus.None;
    },
    resetGetMemberByGroupChatId: (state) => {
      state.loadGetMemberByGroupChatId = ApiLoadingStatus.None;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createGroupChat.pending, (state) => {
        state.loadCreateGroupChat = ApiLoadingStatus.Loading;
      })
      .addCase(createGroupChat.fulfilled, (state, action) => {
        state.loadCreateGroupChat = ApiLoadingStatus.Success;
      })
      .addCase(createGroupChat.rejected, (state, action) => {
        state.loadCreateGroupChat = ApiLoadingStatus.Failed;
      })
      .addCase(getGroupChat.pending, (state) => {
        state.loadGetGroupChat = ApiLoadingStatus.Loading;
      })
      .addCase(getGroupChat.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loadGetGroupChat = ApiLoadingStatus.Success;
      })
      .addCase(getGroupChat.rejected, (state, action) => {
        state.loadGetGroupChat = ApiLoadingStatus.Failed;
      })
      .addCase(getMemberByGroupChatId.pending, (state) => {
        state.loadGetMemberByGroupChatId = ApiLoadingStatus.Loading;
      })
      .addCase(getMemberByGroupChatId.fulfilled, (state, action) => {
        state.member = action.payload;
        state.loadGetMemberByGroupChatId = ApiLoadingStatus.Success;
      })
      .addCase(getMemberByGroupChatId.rejected, (state, action) => {
        state.member = [];
        state.loadGetMemberByGroupChatId = ApiLoadingStatus.Failed;
      });
  },
});

export const { resetLoadCreateGroupChat, resetLoadGetGroupChat } =
  groupChatSlice.actions;

export default groupChatSlice.reducer;
