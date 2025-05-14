import { Context } from "../utils/context";
import * as ApiClientFactory from "./api-generated";

export * from "./api-generated";

const api_url: string = Context.apiUrl ?? "http://localhost:3000";

// define authorize common function, we also can config interceptors here
const authorizedFetchFunction = (
  url: RequestInfo,
  init: RequestInit
): Promise<Response> => {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${Context.token}`,
  };
  init = init || {};
  init.headers = Object.assign({}, init.headers, headers);
  return fetch(url, init);
};
const userClient = new ApiClientFactory.UserControllerClient(api_url, {
  fetch: authorizedFetchFunction,
});

const deviceClient = new ApiClientFactory.DeviceControllerClient(api_url, {
  fetch: authorizedFetchFunction,
});

const deviceDetailClient = new ApiClientFactory.DeviceDetailControllerClient(
  api_url,
  {
    fetch: authorizedFetchFunction,
  }
);

const recordClient = new ApiClientFactory.RecordControllerClient(api_url, {
  fetch: authorizedFetchFunction,
});

const scheduleClient = new ApiClientFactory.ScheduleControllerClient(api_url, {
  fetch: authorizedFetchFunction,
});

const diagnosisClient = new ApiClientFactory.DiagnosisControllerClient(
  api_url,
  {
    fetch: authorizedFetchFunction,
  }
);

const notificationScheduleClient =
  new ApiClientFactory.NotificationControllerClient(api_url, {
    fetch: authorizedFetchFunction,
  }
);

const chatClient = new ApiClientFactory.ChatControllerClient(api_url, {
  fetch: authorizedFetchFunction,
});

const statisticClient = new ApiClientFactory.StatisticControllerClient(
  api_url,
  {
    fetch: authorizedFetchFunction,
  }
);

const groupChatClient = new ApiClientFactory.GroupChatControllerClient(api_url, {
  fetch: authorizedFetchFunction,
})

interface IService {
  userService: ApiClientFactory.UserControllerClient;
  deviceService: ApiClientFactory.DeviceControllerClient;
  deviceDetailService: ApiClientFactory.DeviceDetailControllerClient;
  recordService: ApiClientFactory.RecordControllerClient;
  scheduleService: ApiClientFactory.ScheduleControllerClient;
  diagnosisService: ApiClientFactory.DiagnosisControllerClient;
  notificationScheduleService: ApiClientFactory.NotificationControllerClient;
  chatService: ApiClientFactory.ChatControllerClient;
  statisticService: ApiClientFactory.StatisticControllerClient;
  groupChatService: ApiClientFactory.GroupChatControllerClient;
}

export const Service: IService = {
  userService: userClient,
  deviceService: deviceClient,
  deviceDetailService: deviceDetailClient,
  recordService: recordClient,
  scheduleService: scheduleClient,
  diagnosisService: diagnosisClient,
  notificationScheduleService: notificationScheduleClient,
  chatService: chatClient,
  statisticService: statisticClient,
  groupChatService: groupChatClient,
};
