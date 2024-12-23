import SpotifyWebApi from "spotify-web-api-js";
import { useTrackTree } from "../utils/TrackTreeContext";
import TrackList from "./TrackList";
import TrackTree from "./TrackTree";
import { Sphere } from "../utils/Types";
import { useEffect } from "react";

interface Props {
  sphere: Sphere;
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs;
}

export default function TrackTreeWrapper({ sphere, spotifyApi }: Props) {
  const { initializeTree } = useTrackTree();

  useEffect(() => {
    initializeTree(sphere);
  }, [sphere]);

  return (
    <div>
      <div className="absolute inset-0 bg-background flex">
        <TrackTree spotifyApi={spotifyApi} />
      </div>
      <TrackList spotifyApi={spotifyApi} />
    </div>
  );
}