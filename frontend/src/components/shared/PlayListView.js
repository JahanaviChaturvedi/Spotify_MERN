import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const PlaylistView = ({ titleText, cardsData = [] }) => {
  const [songs, setSongs] = useState([]);
  const navigate = useNavigate();
  const { playlistId } = useParams(); 
  // console.log("URL",playlistId);

  useEffect(() => {
    const fetchPlaylistSongs = async () => {
      try {
        if (playlistId) {
          const token = document.cookie.split("token=")[1];
          const response = await fetch(`http://localhost:3003/playlist/get/playlist/${playlistId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          if (data.success && data.data.songs) {
            setSongs(data.data.songs); 
          } else {
            console.error("Failed to fetch songs:", data.err || "Unexpected response structure");
          }
        }
      } catch (error) {
        console.error("Error fetching playlist songs:", error.message || error);
      }
    };

    fetchPlaylistSongs();
  }, [playlistId]);

  const handleCardClick = (playlistId) => {
    // console.log("playlistID:", playlistId); 
    if (playlistId) {
      navigate(`/playlist/${playlistId}`);
    } else {
      console.error("Invalid playlistId provided.");
    }
  };

  return (
    <div className="text-white mt-7">
      <div className="text-2xl font-semibold mb-5">{titleText}</div>
      <div className="w-full flex justify-start flex-wrap gap-4">
        {playlistId && songs.length > 0 ? ( 
          songs.map((song) => (
            <Card
              key={song._id}
              title={song.name}
              description={song.artist?.firstName || "Unknown Artist"} 
              imgUrl={song.thumbnail}
              songUrl={song.track}
              onClick={() => handleCardClick(null, song.track)} // No playlistId for songs
            />
          ))
        ) : cardsData.length > 0 ? (
          cardsData.map((item) => (
            <Card
              key={item._id}
              title={item.name}
              description={item.description}
              imgUrl={item.thumbnail}
              onClick={() => handleCardClick(item._id)} 
            />
          ))
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
};

const Card = ({ title, description, imgUrl, onClick }) => (
  <div
    className="bg-black bg-opacity-40 w-1/5 p-4 rounded-lg cursor-pointer"
    onClick={onClick}
  >
    <div className="pb-4 pt-2">
      <img className="w-full rounded-md" src={imgUrl} alt="Playlist Thumbnail" />
    </div>
    <div className="text-white font-semibold py-3">{title}</div>
    <div className="text-gray-500 text-sm">{description}</div>
  </div>
);

export default PlaylistView;