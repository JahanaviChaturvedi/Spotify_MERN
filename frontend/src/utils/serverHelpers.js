import { backendUrl } from "./config";

// Retrieve the token from cookies
const getToken = () => {
  const accessToken = document.cookie.replace(
    /(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/,
    "$1"
  );
  // const accessToken = localStorage.getItem("token");
  // console.log("Retrived token", accessToken);
  return accessToken;
};


export const makeUnauthenticatedPOSTRequest = async (route, body) => {
  const response = await fetch(backendUrl + route, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const formattedResponse = await response.json();
  return formattedResponse;
};

// export const makeAuthenticatedPOSTRequest = async (route, body) => {
//   const token = getToken();
//   const response = await fetch(backendUrl + route, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify(body),
//   });
//   const formattedResponse = await response.json();
//   return formattedResponse;
// };

export const makeAuthenticatedPOSTRequest = async (route, body) => {
  const token = document.cookie.replace(
    /(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/,
    "$1"
  );
  console.log("Sending request to:", route); // Debug endpoint
  console.log("Payload:", body); // Debug payload
  const response = await fetch(`http://localhost:3003${route}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
};


export const makeAuthenticatedGETRequest = async (route) => {
  const token = getToken();
  const response = await fetch(backendUrl + route, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    redirect: "follow",
  });
  if(!response.ok){
    throw new Error(`HTTP error! Status:${response.status}`)
  }
  const formattedResponse = await response.json();
  return formattedResponse;
};
