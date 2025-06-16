import { useState } from "react";
import { makeUnauthenticatedPOSTRequest } from "../utils/serverHelpers";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleForgotPassword = async () => {
    try {
      const response = await makeUnauthenticatedPOSTRequest(
        "/auth/forgot-password",
        { email }
      );
      if (response && response.message) {
        setMessage("Password reset link sent to your email.");
      } else {
        setMessage("Failed to send reset link. Please try again.");
      }
    } catch (error) {
      console.error("Error sending password reset link:", error);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      <h2 className="font-bold text-xl my-4">Forgot Password</h2>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 border rounded w-1/3 mb-4"
      />
      <button
        onClick={handleForgotPassword}
        className="bg-green-400 font-semibold p-3 px-8 rounded"
      >
        Send Reset Link
      </button>
      {message && <div className="text-gray-400 mt-4">{message}</div>}
    </div>
  );
};

export default ForgotPassword;
