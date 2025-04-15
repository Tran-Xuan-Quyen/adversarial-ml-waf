import { useState, useEffect, useRef } from "react";
import "./chat.scss";
import {
  loadMessages,
  resetGetMessageStatus,
  resetSendMessageStatus,
  sendMessage as sendMessageRedux,
} from "../../redux/reducer/chatSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  MessageSchema,
  MessageRequest,
  UserResponse,
  GroupChatSchema,
  GroupMemberResponse,
} from "../../api";
import { ApiLoadingStatus } from "../../utils/loadingStatus";
import {
  getAdminAndPatientByDoctorId,
  getAllExceptSelf,
  getAllUsers,
  getDoctorByPatientId,
  getPatientByDoctorId,
  getUserById,
} from "../../redux/reducer/userSlice";
import {
  Avatar,
  Button,
  Col,
  Form,
  Input,
  List,
  Modal,
  Row,
  Select,
} from "antd";
import dayjs from "dayjs";
import io from "socket.io-client";
import {
  createGroupChat,
  getGroupChat,
  getMemberByGroupChatId,
  resetLoadCreateGroupChat,
} from "../../redux/reducer/groupChatSlice";
import groupChatImg from "../../assets/groupChat.svg";
import { IoMdChatbubbles } from "react-icons/io";
import { Context } from "../../utils/context";
import { convertRoleToString, userRole } from "../../constants";
import avatar from "../../assets/avatar.svg";
import groupAvatar from "../../assets/groupAvatar.svg";
import { showNotiError, showNotiSuccess } from "../../components/notification";
const socket = io("http://localhost:3000");

export const ChatMes: React.FC = () => {
  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.user);
  const dataState = useAppSelector((state) => state.chat);
  const groupState = useAppSelector((state) => state.groupChat);
  const [accountData, setAccountData] = useState<UserResponse>(
    {} as UserResponse
  );
  const [userDropDown, setUserDropDown] = useState<any[]>([]);

  const [messages, setMessages] = useState<MessageSchema[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [groupChat, setGroupChat] = useState<GroupChatSchema[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [selectedPerson, setSelectedPerson] = useState<string>("");
  const [role, setRole] = useState<number>(0);
  const [showTimestamp, setShowTimestamp] = useState<number | null>(null);
  const [showUser, setShowUser] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [groupTitle, setGroupTitle] = useState("");
  const [personalName, setPersonalName] = useState("");
  const [isShowMember, setIsShowMember] = useState<boolean>(false);
  const [member, setMember] = useState<GroupMemberResponse[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [form] = Form.useForm();

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (Context.role === userRole.admin) dispatch(getAllExceptSelf());
    if (Context.role === userRole.doctor)
      dispatch(getAdminAndPatientByDoctorId());
    if (Context.role === userRole.patient) dispatch(getDoctorByPatientId());
  }, []);

  useEffect(() => {
    if (userState.loadDataStatus === ApiLoadingStatus.Success) {
      console.log(userState.data);
      setUserDropDown(
        userState.data.map((user) => ({
          label: user.username,
          value: user.id,
          role: user.role_id,
        }))
      );
    }
  }, [userState.loadDataStatus]);

  useEffect(() => {
    if (groupState.loadGetGroupChat === ApiLoadingStatus.Success) {
      console.log(groupState.data);
      setGroupChat(groupState.data);
    }
  }, [groupState.loadGetGroupChat]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    dispatch(getUserById("user-info"));
  }, []);

  useEffect(() => {
    console.log(userState.loadGetUserByIdStatus);
    if (userState.loadGetUserByIdStatus === ApiLoadingStatus.Success) {
      setAccountData(userState.userData);
    }
  }, [userState.loadGetUserByIdStatus]);

  useEffect(() => {
    dispatch(getGroupChat(accountData.id));
  }, [accountData]);

  // Gửi tin nhắn
  const sendMessage = () => {
    if (selectedGroup || selectedRoomId) {
      if (newMessage.trim() !== "") {
        const messageData = {
          message: newMessage,
          groupChatId: selectedGroup || selectedRoomId,
          time: new Date().toISOString(),
          senderId: accountData.id,
          senderName: accountData.username,
        };

        const messageRequest = MessageRequest.fromJS(messageData);
        dispatch(sendMessageRedux(messageRequest));
        setNewMessage("");
      }
    }
  };

  useEffect(() => {
    if (selectedGroup || selectedRoomId) {
      socket.emit("joinGroup", selectedGroup || selectedRoomId);
      socket.on(
        `receiveMessageFrom${selectedGroup || selectedRoomId}`,
        (message) => {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      );
    }

    return () => {
      socket.off(`receiveMessageFrom${selectedGroup || selectedRoomId}`);
    };
  }, [selectedGroup, selectedRoomId]);

  useEffect(() => {
    let privateRoomId = "";
    if (selectedPerson) {
      privateRoomId =
        selectedPerson < accountData.id
          ? `${accountData.id}-${selectedPerson}`
          : `${selectedPerson}-${accountData.id}`;
    }

    setSelectedRoomId(privateRoomId);
    console.log("Private Room ID:", privateRoomId);
  }, [selectedPerson]);

  useEffect(() => {
    if (selectedGroup || selectedRoomId) {
      dispatch(
        loadMessages({
          groupChatId: selectedGroup || selectedRoomId,
        })
      );
    } else setMessages([]);
  }, [selectedGroup, selectedRoomId, accountData.id]);

  useEffect(() => {
    if (dataState.loadGetMessageStatus === ApiLoadingStatus.Success) {
      setMessages(dataState.messages);
      dispatch(resetGetMessageStatus());
    }
  }, [dataState.loadGetMessageStatus, dispatch]);

  useEffect(() => {
    if (dataState.loadSendMessageStatus === ApiLoadingStatus.Success) {
      dispatch(resetSendMessageStatus());
    }
  }, [dataState.loadSendMessageStatus, dispatch]);

  const getAvatarInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCreateGroup = (values: any) => {
    const payload = {
      title: values.title,
      hostId: accountData.id,
      member: [...values.member, accountData.id],
    };

    console.log("Payload:", payload);

    dispatch(createGroupChat(payload as any));
  };

  useEffect(() => {
    if (groupState.loadCreateGroupChat === ApiLoadingStatus.Success) {
      showNotiSuccess("Bạn đã tạo nhóm thành công!");
      setIsModalOpen(false);
      form.resetFields();
      dispatch(getGroupChat(accountData.id));
      dispatch(resetLoadCreateGroupChat());
    }
    if (groupState.loadCreateGroupChat === ApiLoadingStatus.Failed) {
      showNotiError("Tạo nhóm thất bại, vui lòng thử lại!");
      form.resetFields();
      dispatch(resetLoadCreateGroupChat());
    }
  }, [groupState.loadCreateGroupChat]);

  useEffect(() => {
    if (groupState.loadGetMemberByGroupChatId === ApiLoadingStatus.Success) {
      setMember(groupState.member);
    }
  }, [groupState, selectedGroup]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredUsers = userDropDown.filter((user) =>
    user.label.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="chat-container">
      <div className="sidebar">
        <div className="navbar">
          <IoMdChatbubbles className="chat-icon" />
          <span className="logo">Tin nhắn</span>
        </div>

        {Context.role !== userRole.patient && (
          <Button
            className="create-group-btn"
            onClick={() => setIsModalOpen(true)}
          >
            + Tạo nhóm
          </Button>
        )}

        <div className="search">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="search-bar"
            onChange={(e) => handleSearchChange(e)}
            value={searchQuery}
          />
        </div>

        <div className="chats">
          {[...filteredUsers, ...groupChat].map((item) => {
            const isGroup = !!item._id;
            return (
              <div
                key={isGroup ? item._id : item.value}
                className={`userChat ${
                  (isGroup && selectedGroup === item._id) ||
                  (!isGroup && selectedPerson === item.value)
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  if (isGroup) {
                    setSelectedPerson("");
                    setGroupTitle(item.title);
                    setSelectedGroup(item._id);
                  } else {
                    setSelectedGroup("");
                    setSelectedPerson(item.value);
                    setPersonalName(item.label);
                    setRole(item.role);
                  }
                }}
              >
                <img src={isGroup ? groupAvatar : avatar} alt="avatar" />
                <div className="userChatInfo">
                  <span>{isGroup ? item.title : item.label}</span>
                  <p>
                    {isGroup
                      ? `Nhóm ${item.title}`
                      : `${convertRoleToString(item.role)} ${item.label}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="chat-box-container"
        style={{
          borderRight:
            !selectedGroup && !selectedPerson ? "1px solid #ccc" : "",
          borderTop: !selectedGroup && !selectedPerson ? "1px solid #ccc" : "",
          borderBottom:
            !selectedGroup && !selectedPerson ? "1px solid #ccc" : "",
          borderTopRightRadius: !selectedGroup && !selectedPerson ? "10px" : "",
          borderBottomRightRadius:
            !selectedGroup && !selectedPerson ? "10px" : "",
        }}
      >
        {!selectedGroup && !selectedPerson ? (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <img
              src={groupChatImg}
              alt="No Group Selected"
              style={{ width: "100%", maxWidth: "550px" }}
            />
            <h3>Chọn một người hoặc nhóm để bắt đầu cuộc trò chuyện! 🚀</h3>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <h3
                onClick={() => {
                  if (
                    !selectedGroup.includes(accountData.id) &&
                    !selectedRoomId.includes(accountData.id)
                  ) {
                    setIsShowMember(true);
                    console.log(selectedGroup);
                    dispatch(getMemberByGroupChatId(selectedGroup));
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                {selectedGroup.includes(accountData.id) ||
                selectedRoomId.includes(accountData.id)
                  ? `Tin nhắn với ${convertRoleToString(
                      role
                    ).toLowerCase()} ${personalName}`
                  : `Tin nhắn với nhóm ${groupTitle}`}
              </h3>
            </div>

            <div className="chat-messages">
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${
                      msg.senderId === accountData.id ? "self" : "other"
                    }`}
                    onMouseEnter={() => {
                      setShowTimestamp(index);
                      setShowUser(msg.senderName);
                    }}
                    onMouseLeave={() => setShowTimestamp(null)}
                    style={{ position: "relative", cursor: "pointer" }}
                  >
                    <div className={`avatar ${msg.before ? "hidden" : ""}`}>
                      {getAvatarInitial(msg.senderName)}
                    </div>

                    {msg.senderId === accountData.id ? (
                      <div>
                        <Row gutter={5}>
                          <Col>
                            {showTimestamp === index && (
                              <div className="message-time">
                                <em>
                                  {showUser} - {""}
                                  {typeof msg.time === "number"
                                    ? dayjs
                                        .unix(msg.time)
                                        .format("HH:mm, DD/MM/YYYY")
                                    : dayjs(msg.time).format(
                                        "HH:mm, DD/MM/YYYY"
                                      )}
                                </em>
                              </div>
                            )}
                          </Col>
                          <Col>
                            <span>{msg.message}</span>
                          </Col>
                        </Row>
                      </div>
                    ) : (
                      <div>
                        <Row gutter={5}>
                          <Col>
                            <span>{msg.message}</span>
                          </Col>
                          <Col>
                            {showTimestamp === index && (
                              <div className="message-time">
                                <em>
                                  {showUser} - {""}
                                  {dayjs
                                    .unix(msg.time)
                                    .format("HH:mm, DD/MM/YYYY")}
                                </em>
                              </div>
                            )}
                          </Col>
                        </Row>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div>
                  {selectedGroup.includes(accountData.id) ||
                  selectedRoomId.includes(accountData.id)
                    ? "💬 Gửi lời chào để bắt đầu cuộc trò chuyện!"
                    : "💬 Chưa có tin nhắn nào trong nhóm này, hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện! 🚀"}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Ô nhập tin nhắn */}
            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        )}
      </div>

      <Modal
        width={"400px"}
        title="Tạo nhóm mới"
        open={isModalOpen}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
        onCancel={() => {
          form.resetFields();
          setIsModalOpen(false);
        }}
      >
        <Form
          form={form}
          layout="horizontal"
          onFinish={handleCreateGroup}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          <Form.Item
            label="Tên nhóm"
            name="title"
            key="title"
            style={{ marginTop: "30px", marginBottom: "0px" }}
          >
            <Input placeholder="Nhập tên nhóm" />
          </Form.Item>
          <Form.Item
            label="Thành viên"
            name="member"
            key="member"
            style={{ marginTop: "15px" }}
          >
            <Select
              mode="multiple"
              placeholder="Chọn thành viên"
              options={userDropDown}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        width={350}
        title={
          <h3 style={{ fontWeight: "bold", textAlign: "center" }}>
            Danh sách thành viên nhóm
          </h3>
        }
        open={isShowMember}
        footer={null}
        onCancel={() => setIsShowMember(false)}
      >
        <List
          dataSource={member}
          size="small"
          renderItem={(item) => (
            <List.Item
              style={{
                paddingLeft: "60px",
                transition: "0.3s",
                borderRadius: "8px",
              }}
            >
              <List.Item.Meta
                avatar={
                  <img
                    src={avatar}
                    alt="avatar"
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      backgroundColor: "#1890ff",
                    }}
                  />
                }
                title={
                  <span style={{ fontSize: "15px", fontWeight: "500" }}>
                    {item.username}
                  </span>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};
