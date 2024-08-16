import { useEffect, useId, useRef, useState } from "react";
import { useSetUser } from "../store/store";
import Picker from "emoji-picker-react";

const TalkInput = ({ setMessage }) => {
  const [inputVal, setInputVal] = useState("");
  const { name } = useSetUser();
  const { setUser } = useSetUser();
  const [userId, setUserId] = useState(""); // 현재 사용자의 ID를 저장할 상태
  const [showPicker, setShowPicker] = useState(false);
  const fileInputRef = useRef(null); // Ref 생성
  const socketRef = useRef(null); // 소켓 ref

  useEffect(() => {
    createSocket();

    return () => {
      if (socketRef.current) {
        console.log("Closing WebSocket connection...");
        socketRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    console.log("userId 업데이트됨:", userId);
  }, [userId]);

  const handleInput = (e) => {
    // input으로 입력되는 메시지 저장
    setInputVal(e.target.value);
  };

  const handleSendMsg = (src) => {
    if (inputVal.length === 0 && !src) {
      window.alert("메시지를 입력해주세요!");
      return false;
    }

    const nowTime = getSendTime();

    const messageData = {
      name: name,
      id: userId,
      message: inputVal.length === 0 ? src : inputVal,
      time: nowTime,
    };
    console.log("kyj 보낼 데이터:", userId);

    const socket = createSocket();
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("메시지 전송 성공했음~");
      socket.send(JSON.stringify(messageData));
      setInputVal("");
    } else {
      alert("서버에 연결되어 있지 않습니다.");
      console.log("Socket connection is not open.");
    }
  };

  const createSocket = () => {
    let socketCurrent;

    if (socketRef.current) {
      // 이미 생성된 경우
      console.log("kyj 1");
      socketCurrent = socketRef.current;
    } else {
      // 포트 연결
      console.log("kyj 2");
      socketCurrent = new WebSocket("ws://localhost:3001");
    }

    socketCurrent.onmessage = async function (e) {
      const data = JSON.parse(e.data);

      if (data.type === "userIn") {
        // 새로운 사용자 ID가 이전과 다를 때만 업데이트
        setUserId((prevUserId) => {
          console.log("New userId:", prevUserId);
          if (prevUserId === data.clientId || !prevUserId) {
            // 이건 같은 사용자거나 첫 진입 -> user 정보 업데이트 o / 안내 메시지 전달
            setUser({ name: name, id: data.clientId });
            return data.clientId;
          } else {
            // 이건 다른 사용자 입장 -> user정보 업데이트 x / 안내 메시지 전달
            setMessage((prevMessage) => [...prevMessage, data]);
            return prevUserId;
          }
        });
        console.log("userId:", userId);
      } else if (data.type === "userOut") {
        // 상대방 나감
        setMessage((prevMessage) => [...prevMessage, data]);
      } else {
        // chatMsg 타입 (안내 메시지 아닌 경우)
        setMessage((prevMessage) => [...prevMessage, data]);
      }
    };

    // 소켓을 ref에 저장
    socketRef.current = socketCurrent;

    return socketCurrent;
  };

  const getSendTime = () => {
    const nowTime = new Date();
    const hours = String(nowTime.getHours()).padStart(2, "0"); // 시간
    const minutes = String(nowTime.getMinutes()).padStart(2, "0"); // 분
    const time = `${hours}:${minutes}`; // 시간과 분을 조합하여 문자열로 만듦
    return time;
  };

  const handleOpenFile = () => {
    // 전송한 이미지 초기화 해줌 => 같은 이미지 다시 전송 시에 이벤트 발생 안하는 현상 수정
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleSelectImg = (e) => {
    // 사용자가 파일에서 이미지 선택했을 때
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
      // 메시지 전송 함수로 src 전달 (onload가 완료되고 전송 처리)
      handleSendMsg(reader.result);
      setInputVal(""); // 이미지 선택 후 inputVal 비우기
    };
  };

  const onEmojiClick = (event) => {
    setInputVal((prevInput) => prevInput + event.emoji);
    setShowPicker(false);
  };

  const handleKeyPress = (e) => {
    // 엔터키(텐키 엔터키) 치면 메시지 전송 되는 기능
    if (e.code === "Enter" || e.code === "NumpadEnter") {
      handleSendMsg();
    } else {
      return false;
    }
  };

  return (
    <div>
      <div className="max-w-2xl mx-auto" style={{ maxWidth: "60rem" }}>
        <label htmlFor="chat" className="sr-only">
          Your message
        </label>
        <div className="flex items-center py-2 px-3 bg-gray-50 rounded-lg dark:bg-gray-700">
          {/* <label htmlFor="fileInput">> */}
          <button
            type="button"
            className="inline-flex justify-center p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600"
            onClick={handleOpenFile}
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
          {/* </label> */}
          <input
            ref={fileInputRef}
            type="file"
            id="fileInput"
            style={{ display: "none", letterSpacing: "1px" }}
            onChange={(e) => {
              handleSelectImg(e);
            }}
          />

          <button
            type="button"
            className="p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600"
            // id="pickerContainer"
            onClick={() => setShowPicker((val) => !val)}
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
          <input
            id="chat"
            rows="1"
            className="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Your message..."
            value={inputVal}
            onChange={handleInput}
            onKeyPress={(e) => handleKeyPress(e)}
            autoComplete="off"
          ></input>
          <button
            onClick={() => handleSendMsg()}
            className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600"
          >
            <svg
              className="w-6 h-6 rotate-90"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
            </svg>
          </button>
        </div>

        {showPicker && (
          <div style={{ position: "absolute", top: "50px", left: "160px" }}>
            <Picker
              pickerStyle={{ width: "100%" }}
              onEmojiClick={onEmojiClick}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TalkInput;
