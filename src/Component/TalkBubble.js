import { useEffect, useRef, useState } from "react";
import { useSetUser } from "../store/store";

const TalkBubble = (props) => {
  const { message } = props;
  const { id: currentUserId } = useSetUser();

  useEffect(() => {
    // 메시지 추가될 때마다 스크롤 이동해서 제일 하단 메시지 보이도록
    const chatContainer = document.querySelector(".bubbleWrap");
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, [message]);

  return (
    <div className="talkWrap">
      <div
        className="bubbleWrap"
        style={{
          width: "100%",
          height: "500px",
          padding: "10px",
          overflowY: "auto",
        }}
      >
        {message.legnth !== 0 &&
          message.map((msg, index) =>
            msg.type === "chatMsg" ? (
              <div
                key={index}
                className={`chat ${
                  msg && msg.id && msg.id === currentUserId
                    ? "chat-end"
                    : "chat-start"
                }`}
              >
                <div className="chat-header">
                  {msg && msg.name ? msg.name : "익명"}
                  <time className="text-xs opacity-50"> {msg.time}</time>
                </div>
                <div
                  className={`chat-bubble ${
                    msg && msg.id && msg.id === currentUserId
                      ? "chat-bubble-warning"
                      : "chat-bubble-secondary"
                  }`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "3px 0",
                  }}
                >
                  {/* 이미지가 포함된 메시지인 경우 */}
                  {msg.message && msg.message.startsWith("data:image") ? (
                    <img
                      src={msg.message}
                      alt="이미지"
                      style={{ maxWidth: "180px", maxHeight: "220px" }}
                    />
                  ) : (
                    <span>{msg.message}</span>
                  )}
                </div>
              </div>
            ) : (
              // 입장, 퇴장 안내 메시지
              <div
                key={index}
                className="badgeWrap"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "10px 0",
                }}
              >
                <div className="badge badge-outline notiMsg" key={index}>
                  {msg.notimsg}
                </div>
              </div>
            )
          )}
      </div>
    </div>
  );
};

export default TalkBubble;
