
import './Css/App.css'
import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";
import SignUp from "./MainComponents/Cards/Auth/SignUp";
import SignIn from "./MainComponents/Cards/Auth/SignIn";
import UserHome from './MainComponents/Cards/User/UserHome';
import UserQuesinProgress from './MainComponents/Cards/User/UserQuesinProg';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/userhome" element={<UserHome />} />
        <Route path="/UserQuesinprogress" element={<UserQuesinProgress/>}></Route>

      </Routes>
    </BrowserRouter>
  );
  
}

export default App
