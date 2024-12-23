import { TrackTreeProvider } from "../utils/TrackTreeContext";
import { AudioPlayerProvider } from "../utils/AudioPlayerContext";
import TrackTreeWrapper from "../components/TrackTreeWrapper";
import { useAuth } from "../utils/AuthContext";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sphere as SphereType } from "../utils/Types";
import { fetchSphere } from "../utils/FirestoreService";

export default function Sphere() {
  const { id } = useParams();
  const { user, spotifyApi } = useAuth();
  const [sphere, setSphere] = useState<SphereType | null>(null);

  const getSphere = async () => {
    if (user && id) {
      const data = await fetchSphere(user.id, id);
      if (data) setSphere(data as SphereType);
    }
  }

  useEffect(() => {
    getSphere();
  }, [id]);

  if (!sphere || !id) return null;
  return (
    <TrackTreeProvider>
      <AudioPlayerProvider>
        <TrackTreeWrapper sphere={sphere} spotifyApi={spotifyApi!} />
      </AudioPlayerProvider>
    </TrackTreeProvider>
  );
}
