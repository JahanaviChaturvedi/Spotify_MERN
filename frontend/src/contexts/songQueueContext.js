import React, { createContext, useState, useContext } from "react";

const SongQueueContext = createContext();

export const SongQueueProvider = ({ children }) => {
  const [globalQueue, setGlobalQueue] = useState([]); 
  const [currentSongIndex, setCurrentSongIndex] = useState(0); 

  const setQueue = (songs) => {
    setGlobalQueue(songs);
    setCurrentSongIndex(0);
  };

  const nextSong = () => {
    if (currentSongIndex < globalQueue.length - 1) {
      setCurrentSongIndex((prevIndex) => prevIndex + 1);
    } else {
      console.log("No next song available.");
    }
  };

  const previousSong = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex((prevIndex) => prevIndex - 1);
    } else {
      console.log("No previous song available.");
    }
  };

  return (
    <SongQueueContext.Provider
      value={{
        globalQueue,
        currentSongIndex,
        setQueue,
        nextSong,
        previousSong,
      }}
    >
      {children}
    </SongQueueContext.Provider>
  );
};

export const useSongQueue = () => useContext(SongQueueContext);