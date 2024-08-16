import { useState } from "react";
import TalkBubble from "./TalkBubble";
import TalkInput from "./TalkInput";

const TalkMain = () => {
  const [message, setMessage] = useState([]);

  return (
    <div style={{ width: "800px" }}>
      <TalkBubble message={message} />
      <TalkInput setMessage={setMessage} />
    </div>
  );
};

export default TalkMain;
