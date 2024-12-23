import { useCallback } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import { useTrackTree } from "./TrackTreeContext";
import { convertTrack, Sphere, Track, TreeNode } from "./Types";
import { useAuth } from "./AuthContext";

export class SpotifyError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'SpotifyError';
  }
}

export const useSpotify = (spotifyApi: SpotifyWebApi.SpotifyWebApiJs) => {
  const { user } = useAuth();
  const { rootNode, addChildrenToNode, updateNode, getTrackList, getTracks, findNodeById } = useTrackTree();

  const getSeedTracks = useCallback((node: TreeNode<Track>) => {
    const seedTracks: Track[] = [];
    let current: TreeNode<Track> | null = node;
    while (current && seedTracks.length < 5) {
      seedTracks.push(current.value);
      if (current.parentId) {
        current = findNodeById(current.parentId, rootNode)!;
      } else {
        break;
      }
    }
    return seedTracks;
  }, []);

  const generateRecommendations = useCallback(
    async (node: TreeNode<Track>, limit: number): Promise<Track[]> => {
      try {
        const seedTracks = getSeedTracks(node);
        const uniqueTracks: Track[] = [];
        const seenTrackNames = new Set(getTracks().map((t) => t.name));
        const maxAttempts = 2;
        const batchSize = 10;

        for (let attempts = 0; attempts < maxAttempts && uniqueTracks.length < limit; attempts++) {
          const response = await spotifyApi.getRecommendations({
            limit: batchSize,
            seed_tracks: seedTracks
              .map((t) => t.id)
              .slice(0, 5)
              .join(",")
          });

          const tracks = response.tracks as SpotifyApi.TrackObjectFull[];
          for (let track of tracks) {
            if (!seenTrackNames.has(track.name) && track.preview_url) {
              uniqueTracks.push(convertTrack(track));
              seenTrackNames.add(track.name);
              if (uniqueTracks.length >= limit) break;
            }
          }
        }

        return uniqueTracks.slice(0, limit);
      } catch (error) {
        throw new SpotifyError(
          "Failed to generate recommendations",
          "recommendations-error"
        );
      }
    }, [getSeedTracks, getTracks, spotifyApi]
  );

  const getRecommendations = useCallback(
    async (node: TreeNode<Track>, limit: number): Promise<void> => {
      try {
        const tracks = await generateRecommendations(node, limit);
        addChildrenToNode(node, tracks);
      } catch (error) {
        console.error("Error in getRecommendations:", error);
        throw error;
      }
    }, [generateRecommendations, addChildrenToNode]
  );

  const reload = useCallback(
    async (node: TreeNode<Track>): Promise<void> => {
      try {
        const tracks = await generateRecommendations(node, 1);
        if (tracks.length > 0) {
          const newNode: TreeNode<Track> = {
            ...node,
            value: tracks[0],
            children: [],
          };
          updateNode(newNode);
        }
      } catch (error) {
        console.error("Error in reload:", error);
        throw error;
      }
    }, [generateRecommendations, updateNode]
  );

  const createPlaylist = useCallback(async (sphere: Sphere) => {
    if (!user) {
      throw new SpotifyError("User not authenticated", "auth-error");
    }
    try {
      const trackList = getTrackList();
      const playlist = await spotifyApi.createPlaylist(user.id, { name: sphere.title, description: sphere.description });
      await spotifyApi.addTracksToPlaylist(
        playlist.id,
        trackList.map((track) => track.uri)
      );
      return playlist;
    } catch (error) {
      throw new SpotifyError("Failed to create playlist", "create-playlist-error");
    }
  }, [getTrackList, spotifyApi, user]);

  const updatePlaylist = useCallback(async (sphere: Sphere) => {
    if (!user)
      throw new SpotifyError("User not authenticated", "auth-error");
    if (!sphere.playlistId)
      throw new SpotifyError("No playlist ID provided", "invalid-playlist-error");

    try {
      const trackList = getTrackList();
      await spotifyApi.replaceTracksInPlaylist(sphere.playlistId, trackList.map((track) => track.uri));
    } catch (error) {
      throw new SpotifyError(
        "Failed to update playlist",
        "update-playlist-error"
      );
    }
  }, [getTrackList, spotifyApi, user]);

  return { getRecommendations, reload, createPlaylist, updatePlaylist };
};
