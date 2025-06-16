import LoggedInContainer from "../containers/LoggedInContainer";
import { useState, useEffect } from "react";
import { makeAuthenticatedGETRequest } from "../utils/serverHelpers";
import { useNavigate } from "react-router-dom";

const Library = () => {
  const [myPlaylists, setMyPlaylists] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      const response = await makeAuthenticatedGETRequest("/playlist/get/me");
      setMyPlaylists(response.data);
    };
    getData();
  }, []);

  const handleCardClick = (playlistId) => {
    navigate(`/playlist/${playlistId}`);
  };

  return (
    <LoggedInContainer currentActiveScreen={"library"}>
      <div className="text-white text-xl p-8 font-semibold">My Playlists</div>
      <div className="py-5 grid gap-5 grid-cols-5">
        {myPlaylists.map((item) => {
          return (
            <Card
              key={item._id}
              title={item.name}
              description=""
              imgUrl={item.thumbnail}
              playlistId={item._id}
              onClick={()=> handleCardClick(item._id)}
            ></Card>
          );
        })}
      </div>
    </LoggedInContainer>
  );
};

const Card = ({ title, description, imgUrl, playlistId, onClick }) => {
  return (
    <div
      className="bg-black bg-opacity-40 w-full p-4 rounded-lg cursor-pointer"
      onClick={onClick}                      
    >
      <div className="pb-4 pt-2">
        <img className="w-full rounded-md" src={imgUrl} alt="PlaylistImg" />
      </div>
      <div className="text-white font-semibold py-3">{title}</div>
      <div className="text-gray-500 text-sm">{description}</div>
    </div>
  );
};

export default Library;
