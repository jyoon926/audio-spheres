import { useNavigate } from "react-router-dom";
import SearchTracks from "../components/SearchTracks";
import { useAuth } from "../utils/AuthContext";
import { createSphere } from "../utils/FirestoreService";
import { Track } from "../utils/Types";

export default function Create() {
  const { user, spotifyApi } = useAuth();
  const navigate = useNavigate();

  const handleSelectInitial = async (track: Track) => {
    const rootNode = {
      id: Math.random().toString(36).slice(2),
      value: track,
      children: [],
      parentId: null,
      selected: false,
    };
    const newSphere = await createSphere(user!.id, rootNode);
    if (newSphere) navigate(`/sphere/${newSphere.id}`);
  };

  return (
    <div className="absolute inset-0 p-6 sm:p-3 sm:pl-20 flex justify-center items-center">
      <div className="bg-glass p-6 rounded-lg backdrop-blur-xl">
        <SearchTracks spotifyApi={spotifyApi!} onSelected={handleSelectInitial} />
      </div>
    </div>
  );
}
