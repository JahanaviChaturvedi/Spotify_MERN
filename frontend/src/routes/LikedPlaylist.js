import { useEffect, useState } from "react";
import LoggedInContainer from "../containers/LoggedInContainer";
import { makeAuthenticatedGETRequest } from "../utils/serverHelpers";

const LikedPlaylist = () => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const response = await makeAuthenticatedGETRequest("/playlist/liked");
        if (response.songs) {
          setLikedSongs(response.songs);
        }
      } catch (err) {
        console.error("Error fetching liked songs:", err);
        setError("Failed to load Liked Songs. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLikedSongs();
  }, []);

  return (
    <LoggedInContainer currentActiveScreen={"likedSongs"}>
      <div className="p-4">
        <h1 className="text-xl font-semibold text-white mt-7">Liked Songs</h1>
        {isLoading ? (
          <p className="text-gray-400">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : likedSongs.length === 0 ? (
          <p className="text-gray-400">You have no liked songs.</p>
        ) : (
        <ul>
          {likedSongs.map((song) => (
            <li key={song._id} className="text-white mb-2">
              <div className="flex items-center">
                <img
                  src={song.thumbnail}
                  alt={song.name}
                  className="h-12 w-12 rounded mr-4"
                />
                <div>
                  <p className="font-medium">{song.name}</p>
                  <p className="text-sm text-gray-400">
                    {song.artist.firstName} {song.artist.lastName}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        )}
      </div>
    </LoggedInContainer>
  );
};

export default LikedPlaylist;
