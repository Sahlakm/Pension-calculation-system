import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 padding">
      <h1 className="text-3xl font-bold mb-6">Pension Management System</h1>
      <div className="btns-container">
      <button onClick={() => navigate("/add-employee")} className="p-3 bg-green-500 text-white rounded-lg btn-container">
        Enter New Pensioner Details
      </button>
      <button className="p-3 bg-green-500 text-white rounded-lg btn-container" onClick={() => alert("Yet to be implemented ...")}> Update Tax / Deductions </button>
      <button className="p-3 bg-green-500 text-white rounded-lg btn-container" onClick={() => alert("Yet to be implemented ...")}> Generate Reports </button></div>
    </div>
  );
};

export default Home;
