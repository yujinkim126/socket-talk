const WebSocket = require("ws");
const http = require("http");
const axios = require("axios");
const { parse } = require("querystring");

// 웹소켓 서버 생성 (포트 3001)
const wss = new WebSocket.Server({ port: 3001 });
let clientCount = 0;

// 서버가 시작되었을 때 실행되는 이벤트
wss.on("listening", () => {
  console.log(`리액트 웹소켓 서버가 실행 중입니다. 포트: ${wss.options.port}`);
});

wss.on("connection", function connection(ws, req) {
  const clientId = ++clientCount;

  // 클라이언트로부터 메시지를 받았을 때 이벤트
  ws.on("message", function incoming(message) {
    // console.log("서버에 들어온 값:", message);

    // 메시지를 JSON으로 파싱
    const parsedMessage = JSON.parse(message);

    // 들어온 메시지에 타입이 없으면 채팅 타입 "chatMsg" 추가 (사실 프론트에서 메시지 보내는 게 채팅밖에 없다)
    const messageWithType = {
      type: parsedMessage.type || "chatMsg",
      ...parsedMessage,
    };

    // 클라이언트로 다시 전송 (서버->클라이언트)
    wss.clients.forEach(function each(client) {
      client.send(JSON.stringify(messageWithType));
    });
  });

  // 클라이언트가 연결되었을 때, 해당 클라이언트에게 고유한 아이디를 전송합니다.
  const userInMsg = {
    type: "userIn",
    notimsg: "상대방이 입장했습니다",
    clientId: clientId,
  };

  // 클라이언트에게 유저 ID 전송 (서버->클라이언트)
  wss.clients.forEach(function each(client) {
    client.send(JSON.stringify(userInMsg));
  });

  // 클라이언트가 연결을 끊었을 때 이벤트
  ws.on("close", function closeSocket(ws, req) {
    const userOutMsg = {
      type: "userOut",
      notimsg: "상대방이 퇴장했습니다",
      clientId: clientId,
    };

    // 클라이언트에게 퇴장한 유저 ID 전송 (서버->클라이언트)
    wss.clients.forEach(function each(client) {
      client.send(JSON.stringify(userOutMsg));
    });
  });
});

// HTTP 서버 생성
const server = http.createServer(async (req, res) => {
  // CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "POST" && req.url === "/api/auth/kakao") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      const { code, client_id, redirect_uri, grant_type } = parse(body);

      // 카카오 API로부터 액세스 토큰 요청
      try {
        console.log("kyj try 시작");
        const response = await axios.post(
          `https://kauth.kakao.com/oauth/token`,
          // 데이터 객체는 두 번째 매개변수로 전달되어야 합니다.
          `grant_type=${grant_type}&client_id=${client_id}&redirect_uri=${redirect_uri}&code=${code}`,
          {
            headers: {
              "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
            },
          }
        );

        // 요청 성공 시 클라이언트에게 토큰 전송
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(response.data));
      } catch (error) {
        console.error("토큰 요청 에러:", error.message);
        res.writeHead(500, { "Content-Type": "text/plain" }); // 에러 응답 코드와 헤더 설정
        res.end("토큰 요청에 실패했습니다.");
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" }); // Not Found 응답 코드와 헤더 설정
    res.end("Not Found");
  }
});

// HTTP 서버 시작
server.listen(3005, () => {
  console.log("HTTP 서버가 포트 3005에서 실행 중입니다.");
});
