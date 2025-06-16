import {
  useContext,
  useState,
  useLayoutEffect,
  useRef,
  useEffect,
} from "react";
import { Howl } from "howler";
import { Icon } from "@iconify/react/dist/iconify.js";
import IconText from "../components/shared/IconText";
import TextWithHover from "../components/shared/TextWithHover";
import songContext from "../contexts/songContext";
import CreatePlaylistModal from "../modals/CreatePlaylistModal";
import AddToPlaylistModal from "../modals/AddToPlaylistModal";
import { makeAuthenticatedPOSTRequest } from "../utils/serverHelpers";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";

const LoggedInContainer = ({ children, currentActiveScreen }) => {
  const { user } = useUser();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [CreatePlaylistModalOpen, setCreatePlaylistModalOpen] = useState(false);
  const [AddToPlaylistModalOpen, setAddToPlaylistModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const { playlistId } = useParams();
  const [cookies] = useCookies(["token"]);
  const token = cookies.token;
  const [isLoading, setIsLoading] = useState(true);
  const [isLooping, setIsLooping] = useState(false);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };
  const navigate = useNavigate();

  const handleUploadClick = () => {
    navigate("/uploadSong");
  };

  const {
    currentSong,
    setCurrentSong,
    soundPlayed,
    setSoundPlayed,
    isPaused,
    setIsPaused,
  } = useContext(songContext);

  const firstUpdate = useRef(true);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await fetch(
          `http://localhost:3003/playlist/get/playlist/${playlistId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        // console.log("Playlist Data:", data);

        if (data.success && data.data.songs) {
          setPlaylist(data.data.songs);
          setCurrentSong(data.data.songs[0]);
        } else {
          console.error(
            "Failed to fetch playlist:",
            data.err || "Unexpected response"
          );
        }
      } catch (error) {
        console.error("Error fetching playlist:", error.message || error);
      }
    };

    if (playlistId) {
      fetchPlaylist();
    }
  }, [playlistId]);

  const handleNext = () => {
    if (!playlist || playlist.length === 0) {
      console.error("Playlist is empty. Cannot move to the next song.");
      return;
    }

    setCurrentSongIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % playlist.length;
      setCurrentSong(playlist[newIndex]);
      // console.log(`Playing next song: ${playlist[newIndex].name}`);
      return newIndex;
    });
  };

  const handlePrevious = () => {
    if (!playlist || playlist.length === 0) {
      console.error("Playlist is empty. Cannot move to the previous song.");
      return;
    }

    setCurrentSongIndex((prevIndex) => {
      const newIndex = (prevIndex - 1 + playlist.length) % playlist.length;
      setCurrentSong(playlist[newIndex]);
      // console.log(`Playing previous song: ${playlist[newIndex].name}`);
      return newIndex;
    });
  };

  useLayoutEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    if (!currentSong) {
      return;
    }
    changeSong(currentSong.track);
  }, [currentSong && currentSong.track]);

  const addSongToPlaylist = async (playlistId) => {
    const songId = currentSong._id;
    const payload = { playlistId, songId };
    const response = await makeAuthenticatedPOSTRequest(
      "/playlist/add/song",
      payload
    );
    if (response._id) {
      setAddToPlaylistModalOpen(false);
    }
  };

  const playSound = () => {
    if (!soundPlayed) {
      return;
    }
    soundPlayed.play();
  };

  const changeSong = (songSrc) => {
    if (!songSrc) {
      console.error("Song source is undefined.");
      return;
    }
    if (soundPlayed) {
      soundPlayed.stop();
    }
    const sound = new Howl({
      src: [songSrc],
      html5: true,
      onload: () => {
        const duration = sound.duration();
        setDuration(duration || 0);
      },
      onend: () => {
        if (isLooping) {
          console.log("Looping over current song.");
          sound.play();
        } else {
          console.log("Song ended. Moving to the next song.");
          handleNext();
        }
      },
      onloaderror: (id, error) => {
        console.error("Error loading audio:", error);
      },
    });

    setSoundPlayed(sound);
    sound.play();
    setIsPaused(false);
  };

  const pausedSound = () => {
    soundPlayed.pause();
  };
  const togglePlayPause = () => {
    if (isPaused) {
      playSound();
      setIsPaused(false);
    } else {
      pausedSound();
      setIsPaused(true);
    }
  };

  const toggleLoop = () => {
    setIsLooping((prevState) => !prevState);
    console.log(`Looping is now ${!isLooping ? "enabled" : "disabled"}`);
  };

  const handleLikeSong = async (songId) => {
    try {
      const response = await makeAuthenticatedPOSTRequest(
        "/playlist/likedSongs",
        { songId }
      );
      if (response.success) {
        console.log("Song liked successfully:", response.message);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error liking the song:", error);
    }
  };

  useEffect(() => {
    if (user && user.likedSongs && currentSong) {
      setIsLiked(user.likedSongs.includes(currentSong._id));
    } else {
      setIsLiked(false);
    }
  }, [currentSong, user]);

  const getUserInitials = () => {
    // console.log("getUserInitials called, user:", user);
    if (user && user.firstName) {
      const firstInitail = user.firstName.charAt(0);
      const lastInitial = user.lastName ? user.lastName.charAt(0) : "";
      return `${firstInitail} ${lastInitial}`;
    }
    return "NA";
  };

  const logoutUser = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      document.cookie =
        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const [volume, setVolume] = useState(1);
  const changeVolume = (newVolume) => {
    setVolume(newVolume);
    if (soundPlayed) {
      soundPlayed.volume(newVolume);
    }
  };

  useEffect(() => {
    if (soundPlayed) {
      const duration = soundPlayed.duration ? soundPlayed.duration() : 0;
      // console.log("Song duration");
      setDuration(duration);
      soundPlayed.on("end", () => {
        console.log("Song ended. Moving to the next song.");
        handleNext();
      });
    } else {
      console.warn(
        "soundPlayed is null or undefined, skipping event listener attachment."
      );
    }

    const interval = setInterval(() => {
      if (soundPlayed && soundPlayed.seek) {
        setCurrentTime(soundPlayed.seek());
      }
    }, 500);
    return () => {
      clearInterval(interval);
      if (soundPlayed) {
        soundPlayed.off("end");
      }
    };
  }, [soundPlayed, handleNext]);

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
  // console.log("Progress percentage:", progressPercentage);

  return (
    <div className="h-full w-full bg-app-black">
      {CreatePlaylistModalOpen && (
        <CreatePlaylistModal
          closeModal={() => {
            setCreatePlaylistModalOpen(false);
          }}
        />
      )}
      {AddToPlaylistModalOpen && (
        <AddToPlaylistModal
          closeModal={() => {
            setAddToPlaylistModalOpen(false);
          }}
          addSongToPlaylist={addSongToPlaylist}
        />
      )}

      <div className={`${currentSong ? "h-9/10" : "h-full"} w-full flex`}>
        {/* {/Side-bar/} */}
        <div className="h-full w-1/5 bg-black flex flex-col justify-between pb-10">
          <div>
            <div className="logoDiv px-5 py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="110"
                height="70"
                viewBox="0 0 512 160"
              >
                <path
                  fill="#fff"
                  d="M79.655 0C35.664 0 0 35.663 0 79.654c0 43.993 35.664 79.653 79.655 79.653c43.996 0 79.656-35.66 79.656-79.653c0-43.988-35.66-79.65-79.657-79.65zm36.53 114.884a4.963 4.963 0 0 1-6.83 1.646c-18.702-11.424-42.246-14.011-69.973-7.676a4.967 4.967 0 0 1-5.944-3.738a4.96 4.96 0 0 1 3.734-5.945c30.343-6.933 56.37-3.948 77.367 8.884a4.965 4.965 0 0 1 1.645 6.83m9.75-21.689c-1.799 2.922-5.622 3.845-8.543 2.047c-21.41-13.16-54.049-16.972-79.374-9.284a6.22 6.22 0 0 1-7.75-4.138a6.22 6.22 0 0 1 4.141-7.745c28.929-8.778 64.892-4.526 89.48 10.583c2.92 1.798 3.843 5.622 2.045 8.538m.836-22.585C101.1 55.362 58.742 53.96 34.231 61.4c-3.936 1.194-8.098-1.028-9.29-4.964a7.453 7.453 0 0 1 4.965-9.294c28.137-8.542 74.912-6.892 104.469 10.655a7.44 7.44 0 0 1 2.606 10.209c-2.092 3.54-6.677 4.707-10.206 2.605zm89.944 2.922c-13.754-3.28-16.198-5.581-16.198-10.418c0-4.57 4.299-7.645 10.7-7.645c6.202 0 12.347 2.336 18.796 7.143c.19.145.437.203.675.165a.9.9 0 0 0 .6-.367l6.715-9.466a.903.903 0 0 0-.171-1.225c-7.676-6.157-16.313-9.15-26.415-9.15c-14.848 0-25.225 8.911-25.225 21.662c0 13.673 8.95 18.515 24.417 22.252c13.155 3.031 15.38 5.57 15.38 10.11c0 5.032-4.49 8.161-11.718 8.161c-8.028 0-14.582-2.71-21.906-9.046a.93.93 0 0 0-.656-.218a.9.9 0 0 0-.619.313l-7.533 8.96a.906.906 0 0 0 .086 1.256c8.522 7.61 19.004 11.624 30.323 11.624c16 0 26.339-8.742 26.339-22.277c.028-11.421-6.81-17.746-23.561-21.821zm59.792-13.564c-6.934 0-12.622 2.732-17.321 8.33V62c0-.498-.4-.903-.894-.903h-12.318a.9.9 0 0 0-.894.902v70.009c0 .494.4.903.894.903h12.318a.9.9 0 0 0 .894-.903v-22.097c4.699 5.26 10.387 7.838 17.32 7.838c12.89 0 25.94-9.92 25.94-28.886c.019-18.97-13.032-28.894-25.93-28.894zm11.614 28.893c0 9.653-5.945 16.397-14.468 16.397c-8.418 0-14.772-7.048-14.772-16.397c0-9.35 6.354-16.397 14.772-16.397c8.38 0 14.468 6.893 14.468 16.396m47.759-28.893c-16.598 0-29.601 12.78-29.601 29.1c0 16.143 12.917 28.784 29.401 28.784c16.655 0 29.696-12.736 29.696-28.991c0-16.2-12.955-28.89-29.496-28.89zm0 45.385c-8.827 0-15.485-7.096-15.485-16.497c0-9.444 6.43-16.298 15.285-16.298c8.884 0 15.58 7.093 15.58 16.504c0 9.443-6.468 16.291-15.38 16.291m64.937-44.258h-13.554V47.24c0-.497-.4-.902-.894-.902H374.05a.906.906 0 0 0-.904.902v13.855h-5.916a.9.9 0 0 0-.894.902v10.584a.9.9 0 0 0 .894.903h5.916v27.39c0 11.062 5.508 16.674 16.38 16.674c4.413 0 8.075-.914 11.528-2.873a.88.88 0 0 0 .457-.78v-10.083a.9.9 0 0 0-.428-.76a.87.87 0 0 0-.876-.039c-2.368 1.19-4.66 1.741-7.229 1.741c-3.947 0-5.716-1.798-5.716-5.812V73.49h13.554a.9.9 0 0 0 .894-.903V62.003a.873.873 0 0 0-.884-.903zm47.217.054v-1.702c0-5.006 1.921-7.238 6.22-7.238c2.57 0 4.633.51 6.945 1.28a.895.895 0 0 0 1.18-.858l-.001-10.377a.89.89 0 0 0-.637-.865c-2.435-.726-5.555-1.47-10.235-1.47c-11.367 0-17.388 6.405-17.388 18.516v2.606H428.2a.906.906 0 0 0-.904.902v10.638c0 .497.41.903.904.903h5.916v42.237c0 .504.41.904.904.904h12.308c.504 0 .904-.4.904-.904V73.487h11.5l17.616 42.234c-1.998 4.433-3.967 5.317-6.65 5.317c-2.168 0-4.46-.646-6.79-1.93a.98.98 0 0 0-.714-.067a.9.9 0 0 0-.533.485l-4.175 9.16a.9.9 0 0 0 .39 1.17c4.356 2.359 8.284 3.367 13.145 3.367c9.093 0 14.125-4.242 18.548-15.637l21.364-55.204a.88.88 0 0 0-.095-.838a.88.88 0 0 0-.733-.392h-12.822a.9.9 0 0 0-.856.605l-13.136 37.509l-14.382-37.534a.9.9 0 0 0-.837-.58h-21.04zm-27.375-.054h-12.318a.907.907 0 0 0-.903.902v53.724c0 .504.409.904.903.904h12.318c.495 0 .904-.4.904-.904v-53.72a.9.9 0 0 0-.904-.903zm-6.088-24.464c-4.88 0-8.836 3.95-8.836 8.828a8.835 8.835 0 0 0 8.836 8.836c4.88 0 8.827-3.954 8.827-8.836a8.83 8.83 0 0 0-8.827-8.828"
                />
              </svg>
            </div>
            <div className="py-2">
              <IconText
                iconName={"material-symbols:home-rounded"}
                displayText={"Home"}
                targetLink={"/home"}
                active={currentActiveScreen === "home"}
              />
              <IconText
                iconName={"iconamoon:search-bold"}
                displayText={"Search"}
                targetLink={"/search"}
                active={currentActiveScreen === "search"}
              />
              <IconText
                iconName={"fluent:library-32-filled"}
                displayText={"Library"}
                targetLink={"/library"}
                active={currentActiveScreen === "library"}
              />
              <IconText
                iconName={"mdi:music-box"}
                displayText={"My Musics"}
                targetLink={"/myMusic"}
                active={currentActiveScreen === "myMusic"}
              />
            </div>
            <div className="pt-7">
              <IconText
                iconName={"icon-park-solid:add"}
                displayText={"Create Playlist"}
                onClick={() => {
                  setCreatePlaylistModalOpen(true);
                }}
              ></IconText>
              <IconText
                iconName={"mynaui:heart-square-solid"}
                displayText={"Liked Songs"}
                targetLink={"/likedSongs"}
                active={currentActiveScreen === "likedSongs"}
              ></IconText>
            </div>
          </div>

          <div className="px-5">
            <div
              className="border border-gray-100 text-white w-2/4 flex px-2 py-1 rounded-full items-center justify-center hover:text-black hover:bg-white cursor-pointer"
              onClick={logoutUser}
            >
              <div className="ml-2 text-sm font-semibold">Log out</div>
            </div>
          </div>
        </div>

        {/* {/Main Spotify/} */}
        <div className="h-full w-4/5 bg-app-black overflow-auto">
          {/* {/Nav-bar/} */}
          <div className="navbar w-full h-1/10 bg-black bg-opacity-30 flex items-center justify-end ">
            <div className="w-1/2 flex h-full">
              <div className="w-2/3 flex justify-around items-center">
                <TextWithHover displayText={"Premium"}></TextWithHover>
                <TextWithHover displayText={"Support"}></TextWithHover>
                <TextWithHover displayText={"Download"}></TextWithHover>
                <div className="h-1/2 border-r border-white"></div>
              </div>
              <div className="w-1/3 flex justify-around h-full items-center">
                <TextWithHover
                  displayText={"Upload Songs"}
                  onClick={handleUploadClick}
                />
                <div className="bg-white w-10 h-10 flex items-center justify-center rounded-full text-black font-semibold cursor-pointer">
                  {getUserInitials()}
                </div>
              </div>
            </div>
          </div>
          <div className="content p-8 pt-0 pt-overflow-auto">{children}</div>
        </div>
      </div>
      {/* {/Current-Playing-Song/} */}
      {currentSong && (
        <div className="w-full h-1/10 bg-black bg-opacity-30 text-white flex items-center px-4">
          <div className="w-1/3 flex items-center">
            <img
              src={currentSong.thumbnail}
              alt="currentSongThumbnail"
              className="h-14 w-14 rounded"
            />
            <div className="pl-4">
              <div className="text-sm hover:underline cursor-pointer">
                {currentSong.name}
              </div>
              <div className="text-xs text-gray-500 hover:underline cursor-pointer">
                {currentSong.artist.firstName +
                  " " +
                  currentSong.artist.lastName}
              </div>
            </div>
          </div>
          <div className="w-1/2 h-full flex justify-center flex-col items-center">
            <div className="flex w-1/2 justify-between items-center">
              <Icon
                icon="famicons:shuffle-outline"
                fontSize={25}
                className="cursor-pointer text-gray-500 hover:text-white "
              />
              <Icon
                icon="fluent:previous-24-filled"
                fontSize={25}
                className="cursor-pointer text-gray-500 hover:text-white"
                onClick={handlePrevious}
              />
              <Icon
                icon={isPaused ? "gridicons:play" : "gridicons:pause"}
                fontSize={45}
                className="cursor-pointer text-gray-500 hover:text-white "
                onClick={togglePlayPause}
              />
              <Icon
                icon="fluent:next-24-filled"
                fontSize={25}
                className="cursor-pointer text-gray-500 hover:text-white"
                onClick={handleNext}
              />
              <Icon
                icon="cil:loop"
                fontSize={23}
                className={`cursor-pointer ${
                  isLooping ? "text-white" : "text-gray-500"
                } hover:text-white`}
                onClick={toggleLoop}
              />
            </div>
            {/* Progress Bar */}
            <div className="w-full h-full flex items-center justify-between overflow-hidden">
              <div className="flex items-center text-sm text-gray-400 min-w-[40px]">
                {formatTime(currentTime)}
              </div>
              <div className="w-4/5 h-2 bg-gray-600 rounded-full relative mx-4">
                <div
                  className="h-full  bg-white rounded-full" //bg-green-500
                  style={{ width: `${progressPercentage}% ` }}
                ></div>
              </div>
              <div className="flex items-center justify-center text-sm text-gray-400 min-w-[40px]">
                {duration > 0 ? formatTime(duration) : "00:00"}
              </div>
            </div>
          </div>
          <div className="w-1/4 flex justify-end pr-8 space-x-4 items-center">
            <Icon
              icon="material-symbols:playlist-add"
              fontSize={30}
              className="cursor-pointer text-gray-500 hover:text-white "
              onClick={() => {
                setAddToPlaylistModalOpen(true);
              }}
            />
            {/* <Icon
              icon="mdi:heart-outline"
              fontSize={20}
              className="text-gray-500 hover:text-white cursor-pointer"
            /> */}
            <Icon
              icon={isLiked ? "mdi:heart" : "mdi:heart-outline"}
              fontSize={20}
              className={`cursor-pointer ${
                isLiked ? "text-red-500" : "text-gray-500"
              } hover:text-white`}
              onClick={() => handleLikeSong(currentSong._id)}
            />
          </div>
          <div className="volume-control flex items-center">
            <Icon
              icon={volume > 0 ? "feather:volume-2" : "feather:volume-x"}
              fontSize={20}
              className="text-gray-500 hover:text-white cursor-pointer"
            />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              className="ml-2 w-24"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LoggedInContainer;
