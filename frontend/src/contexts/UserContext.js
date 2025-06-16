import React, { createContext, useContext, useState, useEffect } from "react";
import { makeAuthenticatedGETRequest } from "../utils/serverHelpers";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await makeAuthenticatedGETRequest("/auth/profile");
        // console.log("Response from /auth/profile", response);
        if (response) {
          // console.log("Fetching user data:", response);
          setUser(response);
        } else {
          console.error("No user found");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
