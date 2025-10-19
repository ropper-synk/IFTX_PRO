import React from "react";
import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  const handleEnter = () => {
    navigate("/home"); // ✅ navigate to Home page
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-r from-blue-400 to-blue-800 text-white">
      <h1 className="text-5xl font-bold mb-6">Welcome to IFTX</h1>
      <p className="text-xl mb-6">Your one-stop store for solar panels!</p>
      <button
        onClick={handleEnter}
        className="bg-white text-blue-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200"
      >
        Enter Store
      </button>
    </div>
  );
}

export default Landing;













// import React from "react";
// import { useNavigate } from "react-router-dom";

// function Landing() {
//   const navigate = useNavigate();

//   const handleEnter = () => {
//     navigate("/home"); // redirect to Home page
//   };

//   return (
//     <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-r from-blue-400 to-blue-800 text-white">
//       <h1 className="text-5xl font-bold mb-6">Welcome to IFTX</h1>
//       <p className="text-xl mb-6">Your one-stop store for solar panels!</p>
//       <button
//         onClick={handleEnter}
//         className="bg-white text-blue-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200"
//       >
//         Enter Store
//       </button>
//     </div>
//   );
// }

// export default Landing;
