import { useState } from "react";
import { useSetUser } from "../store/store";
import { useNavigate } from "react-router-dom";

const Main = () => {
  const [inputName, setInputName] = useState("");
  const { setUser } = useSetUser();
  const navigate = useNavigate();

  const handleInputName = (e) => {
    setInputName(e.target.value);
  };

  const handleKeyPress = (e) => {
    // 엔터키 치면 메시지 전송 되는 기능
    if (e.code === "Enter" || e.code === "NumpadEnter") {
      UseHandleLogin();
    } else {
      return false;
    }
  };

  const UseHandleLogin = () => {
    // 로그인

    if (inputName.length === 0) return;

    setUser({ name: inputName });

    navigate("/talk");
  };

  const handleKakaoLogin = () => {
    const restApi = process.env.REACT_APP_KAKAO_API_KEY;
    const redirect = process.env.REACT_APP_KAKAO_REDIRECT;
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${restApi}&redirect_uri=${redirect}&response_type=code`;

    window.location.href = KAKAO_AUTH_URL;
  };

  return (
    <div className="mainWrap" style={{ margin: "70px" }}>
      <div className="inputNameWrap">
        <p>채팅창에서 사용할 이름을 입력해주세요.</p>
        <div
          className="inputWrap"
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <input
            type="text"
            onChange={handleInputName}
            onKeyPress={(e) => handleKeyPress(e)}
            value={inputName}
            style={{
              height: "40px",
              border: "1px solid black",
              borderRadius: "6px",
              marginRight: "10px",
              paddingLeft: "6px",
            }}
          />
          <button
            onClick={UseHandleLogin}
            style={{
              width: "50px",
              height: "40px",
              borderRadius: "6px",
              backgroundColor: "rgba(103, 103, 103, 1)",
              color: "white",
            }}
          >
            입장
          </button>
        </div>
      </div>
      <div className="snsLoginWrap" style={{ margin: "30px 0" }}>
        <button
          style={{
            width: "120px",
            height: "40px",
            backgroundColor: "#dddd60",
          }}
          onClick={handleKakaoLogin}
        >
          카카오 로그인
        </button>
      </div>
    </div>
  );
};
export default Main;
