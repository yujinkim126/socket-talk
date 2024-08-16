import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import TalkMain from "./Component/TalkMain";
import Main from "./Component/Main";
import Login from "./Component/Login";

function App() {
  return (
    <div
      className="App"
      style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/talk" element={<TalkMain />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/" element={<Main />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
