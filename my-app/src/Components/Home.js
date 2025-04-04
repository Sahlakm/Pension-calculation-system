import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = ({ user }) => {
  console.log("user at", user);
  const navigate = useNavigate();

  if (!user) {
    return (<div><h1 className="text-center text-2xl mt-10"></h1>
     <button
            onClick={() => navigate("/login")}
            className="p-3 bg-green-500 text-white rounded-lg btn-container"
          >Please Login</button>
    </div>);
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 padding">
      <h1 className="text-3xl font-bold mb-6">Pension Management System</h1>

      {user.userType === "Admin" ? (
        // Admin View
        <div className="btns-container">
          <button
            onClick={() => navigate("/add-employee")}
            className="p-3 bg-green-500 text-white rounded-lg btn-container"
          >
            Enter New Pensioner Details
          </button>
          <button
            className="p-3 bg-green-500 text-white rounded-lg btn-container"
            onClick={() => alert("Yet to be implemented ...")}
          >
            Update Tax / Deductions
          </button>
          <button
            className="p-3 bg-green-500 text-white rounded-lg btn-container"
            onClick={() => alert("Yet to be implemented ...")}
          >
            Generate Reports
          </button>
          <button
            onClick={() => navigate("/rules")}
            className="p-3 bg-green-500 text-white rounded-lg btn-container"
          >
            Add/Edit Rules
          </button>
        </div>
      ) : (
        // User View
        <button
          className="p-3 bg-blue-500 text-white rounded-lg btn-container"
          onClick={() => alert("Printing pension details...")}
        >
          Print Pension Details
        </button>
      )}
    </div>
  );
};

export default Home;
