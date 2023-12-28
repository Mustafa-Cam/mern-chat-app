import "./App.css";
import Homepage from "./Pages/Homepage";
import { Route } from "react-router-dom";
import Chatpage from "./Pages/Chatpage";

function App() {
  return (
    <div className="App">
      <Route path="/" component={Homepage} exact /* burda exact in görevi sadece (/) bu route olduğu zaman bu sayfayı getir mesela /about bu route da da / geçiyor. */ /> 
      <Route path="/chats" component={Chatpage} /*bu /chats route ne gelince ChatPage componentii getir */ /> 
    </div>
  );
}

export default App;
