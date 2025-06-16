import { useContext, useEffect, useState } from "react";
import songContext from "../contexts/songContext";
import { Howl } from "howler";

const SingleSongCard = ({ info, playSound }) => {
  const { currentSong, setCurrentSong } = useContext(songContext);
  const [duration, setDuration] = useState(null);

  useEffect(() => {
    if (!info?.track) {
      console.error("Track URL is missing", info?.name);
      return;
    }
    const sound = new Howl({
      src: [info.track],
      html5: true,
      onload: function () {
        const songDuration = sound.duration();
        setDuration(songDuration);
        sound.unload(); 
      },
    });

    return () => sound.unload();
  }, [info?.track]);

  const formatTime = (time) => {
    if (!time || time < 0) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div
      className="flex hover:bg-gray-400 hover:bg-opacity-20 p-2 rounded-md"
      onClick={() => {
        setCurrentSong(info);
      }}
    >
      <div
        className="w-12 h-12 bg-cover bg-center"
        style={{
          backgroundImage: `url("${
            info?.thumbnail
          }")`,
        }}
      ></div>
      <div className="flex w-full">
        <div className="text-white flex justify-center flex-col pl-4 w-5/6">
          <div className="cursor-pointer hover:underline">
            {info?.name}
          </div>
          <div className="text-xs text-gray-400 cursor-pointer hover:underline">
            {info?.artist?.firstName}
            {info?.artist?.lastName}
          </div>
        </div>
        <div className="text-gray-400 text-sm w-1/6 flex items-center justify-center">
          <div className="">
            {duration ? formatTime(duration) : "Loading..."}
          </div>
          <div className="text-gray-400 text-lg flex items-center justify-center pl-3">
            ...
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleSongCard;