import React, { useEffect, useState } from "react";
import LoggedInContainer from "../containers/LoggedInContainer";
import { makeAuthenticatedGETRequest } from "../utils/serverHelpers";
import PlaylistView from "../components/shared/PlayListView";

const Home = () => {
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [recentlyAddedSongs, setRecentlyAddedSongs] = useState([]);
  const [topSongs, setTopSongs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [user, recent, top] = await Promise.all([
          makeAuthenticatedGETRequest("/playlist/get/me"),
          makeAuthenticatedGETRequest("/song/recently-added"),
          makeAuthenticatedGETRequest("/song/top"),
        ]);
        // console.log("User Playlist:", user.data);
        // console.log("User Playlist:", recent.data);
        // console.log(" Top Songs:", top.data);
        
        setUserPlaylists(user.data);
        setRecentlyAddedSongs(recent.data);
        setTopSongs(top.data);
      } catch (error) {
        console.error("Error fetching home page data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <LoggedInContainer currentActiveScreen="home">
      <PlaylistView titleText="My Playlists" cardsData={userPlaylists}/>
      <PlaylistView titleText="Recently Added Songs" cardsData={recentlyAddedSongs}/>
      <PlaylistView titleText="Top Songs" cardsData={topSongs}/>
    </LoggedInContainer>
  );
};

export default Home;
