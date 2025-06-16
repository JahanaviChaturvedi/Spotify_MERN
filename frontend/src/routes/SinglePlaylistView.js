import { useParams } from "react-router-dom";
import LoggedInContainer from "../containers/LoggedInContainer";
import { useEffect, useState } from "react";
import { makeAuthenticatedGETRequest } from "../utils/serverHelpers";
import SingleSongCard from "../components/SingleSongCard";

const SinglePlaylistView = () => {
  const [playlistDetails, setPlaylistDetails] = useState({});
  const { playlistId } = useParams();

  useEffect(() => {
    const getData = async () => {
      const response = await makeAuthenticatedGETRequest("/playlist/get/playlist/" + playlistId);
      // console.log("Playlist Details Before", response);
      if (response.success && response.data) {
        setPlaylistDetails(response.data);
      } else {
        console.error("Failed to fetch playlist:", response.err);
      }
    };
    getData();
  }, [playlistId]);
  
  useEffect(() => {
    // console.log("Playlist Details After Update", playlistDetails);
  }, [playlistDetails]);
  
  useEffect(() => {
    if (playlistDetails.songs) {
      // console.log("Songs inside playlist:", playlistDetails.songs);
    }
  }, [playlistDetails.songs]);

  return (
    <LoggedInContainer currentActiveScreen={"library"}>
      {playlistDetails._id ? (
        <div>
          <div className="text-white text-xl p-8 font-semibold">{playlistDetails.name}</div>
          <div className="pt-10 space-y-3">
            {Array.isArray(playlistDetails.songs) && playlistDetails.songs.length > 0 ? (
              playlistDetails.songs.map((item) => (
                <SingleSongCard
                  key={item._id}
                  info={item}
                  playSound={() => console.log("Playing song:", item.name)}
                />
              ))
            ) : (
              <p className="text-gray-500">No songs available in this playlist.</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-white">Loading playlist details...</p>
      )}
    </LoggedInContainer>
  );
};

export default SinglePlaylistView;
