import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSetUser } from "../store/store";

const Login = () => {
  const { setUser } = useSetUser();
  const navigate = useNavigate();
  const location = useLocation();

  const restApi = process.env.REACT_APP_KAKAO_API_KEY;
  const redirectUrl = process.env.REACT_APP_KAKAO_REDIRECT;

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const authorizationCode = searchParams.get("code");
    // const [userToken, setUserToken] = useState("");

    if (authorizationCode) {
      getTokenServer(authorizationCode);
    }
  }, [location.search]);

  const getTokenServer = async (code) => {
    try {
      // HTTP 요청 설정
      const config = {
        method: "POST", // HTTP 메서드
        url: "http://localhost:3005/api/auth/kakao", // 요청을 보낼 URL
        data: `grant_type=authorization_code&client_id=${restApi}&redirect_uri=${redirectUrl}&code=${code}`, // 요청 데이터 (URL 쿼리 문자열 형식)
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8", // 요청 헤더
          // 여기에 필요한 경우 토큰이나 기타 헤더를 추가할 수 있습니다.
        },
      };

      // 서버로 HTTP 요청을 보냄
      const response = await axios(config);

      // 서버로부터 받은 응답에서 토큰 추출
      const token = response.data.access_token;

      // 추출한 토큰을 적절한 방식으로 저장
      // 예: 로컬 스토리지나 세션 스토리지에 저장

      localStorage.setItem("accessToken", token);

      // 토큰을 가져온 후에 getUserInfo 호출
      getUserInfo();

      // 토큰을 저장한 후에 필요한 작업 수행 가능
      console.log("토큰 저장 및 추가 작업 완료");
    } catch (error) {
      console.error("토큰 요청에 실패했습니다:", error);
    }
  };

  const getUserInfo = async () => {
    //유저 정보 가져오기 (이름)
    const userToken = localStorage.getItem("accessToken");
    try {
      // HTTP 요청 설정
      const config = {
        method: "GET", // HTTP 메서드
        url: "https://kapi.kakao.com/v2/user/me", // 요청을 보낼 URL
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8", // 요청 헤더
          // 여기에 필요한 경우 토큰이나 기타 헤더를 추가할 수 있습니다.
        },
      };

      // 서버로 HTTP 요청을 보냄
      const response = await axios(config);

      // 서버로부터 받은 응답에서 토큰 추출

      // 추출한 토큰을 적절한 방식으로 저장
      // 예: 로컬 스토리지나 세션 스토리지에 저장

      const kakaoName = response.data.properties.nickname;

      setUser({ name: kakaoName }); // 아이디 생성하여 함께 저장

      navigate("/talk", { replace: true });
      // 토큰을 저장한 후에 필요한 작업 수행 가능
      console.log("유저 정보 가져오기 성공");
    } catch (error) {
      console.error("유저 조회에 실패했습니다:", error);
    }
  };

  return <div>로그인 중입니다</div>;
};
export default Login;
