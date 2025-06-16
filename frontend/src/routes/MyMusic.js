import SingleSongCard from "../components/SingleSongCard";
import { makeAuthenticatedGETRequest } from "../utils/serverHelpers";
import { useState, useEffect } from "react";
import LoggedInContainer from "../containers/LoggedInContainer";

const MyMusic = () => {
  const [songData, setSongData] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await makeAuthenticatedGETRequest("/song/get/mysongs");
        setSongData(response.data);
      } catch (error) {
        console.error("Failed to fetch songs:", error);
        if (error.message.includes("401")) {
          alert("Unauthorized access. Please log in again.");
        }
      }
    };
    // fetch data
    getData();
  }, []);

  return (
    <LoggedInContainer currentActiveScreen="myMusic">
      <div className="text-white text-xl font-semibold pb-4 pl-2 pt-8">
        My Songs
      </div>
      <div className="space-y-3 overflow-auto">
        {songData.map((item) => {
          return (
            <SingleSongCard key={item._id} info={item} playSound={() => {}} />
          );
        })}
      </div>
    </LoggedInContainer>
  );
};

export default MyMusic;
