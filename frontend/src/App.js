import "./output.css";
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginComponent from "./routes/Login";
import SignupComponent from "./routes/Signup";
import Home from "./routes/LoggedInHome";
import HomeComponent from "./routes/Home";
import UploadSong from "./routes/UploadSong";
import { UserProvider } from "./contexts/UserContext";
import MyMusic from "./routes/MyMusic";
import { useCookies } from "react-cookie";
import songContext from "./contexts/songContext";
import SearchPage from "./routes/SearchPage";
import Library from "./routes/Library";
import LikedPlaylist from "./routes/LikedPlaylist";
import SinglePlaylistView from "./routes/SinglePlaylistView";
import { SongQueueProvider } from "./contexts/songQueueContext";

function App() {
  const [currentSong, setCurrentSong] = useState(null);
  const [soundPlayed, setSoundPlayed] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [cookie, setCookie] = useCookies("token");

  // console.log(cookie.token);
  return (
    <div className="w-screen h-screen font-poppins">
      <BrowserRouter>
        {cookie.token ? (
          // Logged in routes
          <SongQueueProvider>
            <songContext.Provider
              value={{
                currentSong,
                setCurrentSong,
                soundPlayed,
                setSoundPlayed,
                isPaused,
                setIsPaused,
              }}
            >
              <UserProvider>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/uploadSong" element={<UploadSong />} />
                  <Route path="/myMusic" element={<MyMusic />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/likedSongs" element={<LikedPlaylist />} />
                  <Route
                    path="/playlist/:playlistId"
                    element={<SinglePlaylistView />}
                  />
                  <Route path="*" element={<Navigate to="/home" />} />
                </Routes>
              </UserProvider>
            </songContext.Provider>s
          </SongQueueProvider>
        ) : (
          // Logged out routes
          <Routes>
            <Route path="/" element={<HomeComponent />} />
            <Route path="/login" element={<LoginComponent />} />
            <Route path="/signup" element={<SignupComponent />} />
            <Route path="/home" element={<HomeComponent />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </BrowserRouter>
    </div>
  );
}

export default App;
