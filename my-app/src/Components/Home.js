import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Pension Management System</h1>
      <button onClick={() => navigate("/add-employee")} className="p-3 bg-green-500 text-white rounded-lg">
        Enter Employee Details
      </button>
      
    </div>
  );
};

export default Home;
