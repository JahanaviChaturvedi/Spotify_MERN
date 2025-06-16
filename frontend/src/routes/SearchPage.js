import { useState } from "react";
import LoggedInContainer from "../containers/LoggedInContainer";
import { Icon } from "@iconify/react/dist/iconify.js";
import { makeAuthenticatedGETRequest } from "../utils/serverHelpers";
import SingleSongCard from "../components/SingleSongCard";

const SearchPage = () => {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [songData, setSongData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [playlistData, setPlaylistData] = useState([]);
  const [audioPlayerState, setAudioPlayerState] = useState({
    tracks: [],
    currentTrackIndex: 0,
    isPlaying: false,
  });
  const searchSong = async () => {
    try {
      let response;
      if (searchText.startsWith("artist:")) {
        const artistName = searchText.replace("artist:", "").trim();
        response = await makeAuthenticatedGETRequest(
          `/playlist/search/artist/${artistName}`
        );
      } else if (searchText.startsWith("playlist:")) {
        const playlistName = searchText.replace("playlist:", "").trim();
        response = await makeAuthenticatedGETRequest(
          `/playlist/search/playlist/${playlistName}`
        );
      } else {
        response = await makeAuthenticatedGETRequest(
          `/song/get/songname/${searchText}`
        );
      }

      console.log("Server Response:", response);
      if (response.success) {
        if (response.data.songs || response.data.playlists) {
          setSongData(response.data.songs || []);
          setPlaylistData(response.data.playlists || []);
        } else {
          setSongData(response.data || []);
          setPlaylistData([]);
        }
      } else {
        setSongData([]);
        setPlaylistData([]);
      }

      setHasSearched(true);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSongData([]);
      setPlaylistData([]);
      setHasSearched(true);
    }
  };

  const playPlaylistSongs = (songs) => {
    setAudioPlayerState({
      tracks: songs,
      currentTrackIndex: 0,
      isPlaying: true,
    });
  };

  const handlePlaylistClick = async (playlistId) => {
    try {
      const response = await makeAuthenticatedGETRequest(`/playlist/get/playlist/${playlistId}`);
      console.log("Response Object:", response); // Log the full response
  
      if (response.success) {
        const playlistSongs = response.data.songs || [];
        console.log("Fetched Playlist Songs:", playlistSongs);
  
        // Check if songs exist and proceed
        if (playlistSongs.length > 0) {
          playPlaylistSongs(playlistSongs);
        } else {
          console.error("No songs found in playlist.");
        }
      } else {
        console.error("Failed to fetch playlist:", response.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching playlist:", error);
    }
  };

  return (
    <LoggedInContainer currentActiveScreen="search">
      <div className="w-full py-6">
        <div
          className={`w-1/3 p-3 text-sm rounded-full bg-gray-800 px-5 flex text-white space-x-3 items-center ${
            isInputFocused ? "border border-white" : ""
          }`}
        >
          <div>
            <Icon icon="ic:sharp-search" className="text-xl" />
          </div>
          <input
            type="text"
            placeholder="Search songs or type 'artist:Name'"
            className="w-full bg-gray-800 focus:outline-none"
            onFocus={() => {
              setIsInputFocused(true);
            }}
            onBlur={() => {
              setIsInputFocused(false);
            }}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchSong();
              }
            }}
          />
        </div>
        {!hasSearched ? (
          <div className="text-gray-400 pt-10">Nothing to show here</div>
        ) : (
          <div className="pt-10 space-y-3">
            {songData.length > 0 && (
              <>
                <div className="text-white">
                  Showing song search results for
                  <span className="font-bold"> {searchText}</span>
                </div>
                {songData.map((song) => (
                  <SingleSongCard
                    key={song._id}
                    info={song}
                    playSound={() => console.log("Playing song:", song)}
                  />
                ))}
              </>
            )}

            {playlistData.length > 0 && (
              <>
                <div className="text-white">
                  Showing playlist search results for
                  <span className="font-bold"> {searchText}</span>
                </div>
                {playlistData.map((playlist) => (
                  <div
                    key={playlist._id}
                    className="playlist-card cursor-pointer"
                    onClick={() => handlePlaylistClick(playlist._id)}
                  >
                    <div className="text-white font-bold">{playlist.name}</div>
                    <div>
                      <img
                        src={playlist.thumbnail}
                        alt="Playlist Thumbnail"
                        className="w-20 h-20"
                      />
                    </div>
                  </div>
                ))}
              </>
            )}

            {songData.length === 0 && playlistData.length === 0 && (
              <div className="text-gray-400 pt-10">
                No Results related to
                <span className="font-bold"> {searchText}</span>,<br />
                Please try searching again with correct spelling.
              </div>
            )}
          </div>
        )}
      </div>
    </LoggedInContainer>
  );
};

export default SearchPage;
