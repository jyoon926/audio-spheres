import { Timestamp } from "firebase/firestore";

export interface Track {
  readonly id: string;
  readonly name: string;
  readonly album: Album;
  readonly artists: readonly Artist[];
  readonly duration_ms: number;
  readonly preview_url: string;
  readonly url: string;
  readonly uri: string;
}

export interface Album {
  readonly id: string;
  readonly url: string;
  readonly image: string;
  readonly name: string;
}

export interface Artist {
  readonly id: string;
  readonly name: string;
  readonly url: string;
}

export interface TreeNode<T> {
  readonly id: string;
  readonly value: T;
  readonly children: TreeNode<T>[];
  readonly parentId: string | null;
  readonly selected: boolean;
}

export interface Sphere {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly playlistId?: string;
  readonly playlistUrl?: string;
  readonly createdAt: Timestamp;
  readonly lastEditedAt: Timestamp;
  readonly rootNode: TreeNode<Track>;
}

export function convertTrack(track: SpotifyApi.TrackObjectFull): Track {
  return {
    id: track.id,
    album: {
      id: track.album.id,
      url: track.album.external_urls.spotify,
      image: track.album.images[0].url,
      name: track.album.name,
    },
    artists: track.artists.map((a) => ({
      id: a.id,
      name: a.name,
      url: a.external_urls.spotify,
    })),
    duration_ms: track.duration_ms,
    url: track.external_urls.spotify,
    name: track.name,
    preview_url: track.preview_url,
    uri: track.uri
  };
}
