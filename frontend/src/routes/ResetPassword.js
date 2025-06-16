import { useState } from "react";
import { useParams } from "react-router-dom";
import { makeUnauthenticatedPOSTRequest } from "../utils/serverHelpers";

const ResetPassword = () => {
  const { token } = useParams(); // Get the reset token from the URL
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async () => {
    try {
      const response = await makeUnauthenticatedPOSTRequest(
        `/reset-password/${token}`,
        { newPassword }
      );
      if (response && response.message) {
        setMessage("Password has been reset successfully!");
      } else {
        setMessage("Failed to reset password. Please try again.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      <h2 className="font-bold text-xl my-4">Reset Password</h2>
      <input
        type="password"
        placeholder="Enter new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="p-2 border rounded w-1/3 mb-4"
      />
      <button
        onClick={handleResetPassword}
        className="bg-green-400 font-semibold p-3 px-8 rounded"
      >
        Reset Password
      </button>
      {message && <div className="text-gray-400 mt-4">{message}</div>}
    </div>
  );
};

export default ResetPassword;
