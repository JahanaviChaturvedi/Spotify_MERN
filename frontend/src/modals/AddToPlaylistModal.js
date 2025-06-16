import { useState, useEffect } from "react";
import { makeAuthenticatedGETRequest } from "../utils/serverHelpers";

const AddToPlaylistModal = ({ closeModal, addSongToPlaylist }) => {
  const [myPlaylists, setMyPlaylists] = useState([]);
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await makeAuthenticatedGETRequest("/playlist/get/me");
        console.log("Fetching Playlist:", response.data);
        setMyPlaylists(response.data);
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };
    getData();
  }, []);
  return (
    <div
      className="absolute bg-black w-screen h-screen bg-opacity-50 flex justify-center items-center"
      onClick={closeModal}
    >
      <div
        className="bg-app-black w-1/3 rounded-md p-8"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="text-white mb-5 font-semibold text-lg">
          Select Playlist
        </div>
        <div className="space-y-4 flex flex-col justify-center items-center">
          {myPlaylists.map((item) => {
            return (
              <PlaylistListComponent
                key={item._id}
                info={item}
                addSongToPlaylist={addSongToPlaylist}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
const PlaylistListComponent = ({ info, addSongToPlaylist }) => {
  // console.log("Info received by PlaylistListComponent",info)
  return (
    <div
      className="bg-app-black w-full flex items-center space-x-4  hover:bg-gray-400 hover:bg-opacity-20 cursor-pointer p-3"
      onClick={() => addSongToPlaylist(info._id)}
    >
      <div>
        <img
          src={info.thumbnail}
          className="w-10 h-10 rounded "
          alt="thumbnail"
        />
      </div>
      <div>
        <div className="text-white font-semibold text-sm">{info.name}</div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
