import { useCallback, useEffect, useRef, useState } from "react";
import { useTrackTree } from "../utils/TrackTreeContext";
import { useSpotify } from "../utils/useSpotify";
import SpotifyWebApi from "spotify-web-api-js";
import { MdArrowDropDown, MdOutlineOpenInNew } from "react-icons/md";
import { updateSphere } from "../utils/FirestoreService";
import { useAuth } from "../utils/AuthContext";
import { Track } from "../utils/Types";
import { Link } from "react-router-dom";

interface Props {
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs;
}

const MAX_HEIGHT = 288;
const DEBOUNCE_DELAY = 500;

export default function TrackList({ spotifyApi }: Props) {
  const { user } = useAuth();
  const { sphere, rootNode, getTrackList, setSphere } = useTrackTree();
  const [trackList, setTrackList] = useState<Track[]>([]);
  const { createPlaylist, updatePlaylist } = useSpotify(spotifyApi);
  const [collapsed, setCollapsed] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [title, setTitle] = useState(sphere?.title || "");
  const [description, setDescription] = useState(sphere?.description || "");
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  // Update track list when root node changes
  useEffect(() => {
    if (!rootNode) return;
    setTrackList([...getTrackList()]);
  }, [getTrackList, rootNode]);

  // Update content height when track list changes
  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(Math.min(height, MAX_HEIGHT));
    }
  }, [trackList]);

  // Update title and description when sphere changes
  useEffect(() => {
    setTitle(sphere?.title || "");
    setDescription(sphere?.description || "");
  }, [sphere]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current)
        clearTimeout(updateTimeoutRef.current);
    };
  }, []);

  const handleCreatePlaylist = async () => {
    if (!user || !sphere) return;
    try {
      const playlist = await createPlaylist(sphere);
      updateSphere(user.id, sphere, { playlistId: playlist.id, playlistUrl: playlist.external_urls.spotify });
      setSphere({ ...sphere, playlistId: playlist.id, playlistUrl: playlist.external_urls.spotify });
      window.open(playlist?.external_urls.spotify, "_blank", "noreferrer");
    } catch (error) {
      console.error("Failed to create playlist:", error);
    }
  };

  const handleUpdatePlaylist = async () => {
    if (!user || !sphere) return;
    try {
      await updatePlaylist(sphere);
      window.open(sphere.playlistUrl, "_blank", "noreferrer");
    } catch (error) {
      console.error("Failed to update playlist:", error);
    }
  };

  const handleCollapse = () => {
    setCollapsed(prev => !prev);
  };

  const debouncedUpdate = useCallback((field: string, value: string) => {
    if (!user || !sphere) return;
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = setTimeout(() => {
      updateSphere(user.id, sphere, { [field]: value });
    }, DEBOUNCE_DELAY);
  }, [user, sphere]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    debouncedUpdate('title', newTitle);
  }, [debouncedUpdate]);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
    debouncedUpdate('description', newDescription);
  }, [debouncedUpdate]);

  return (
    <div className="absolute top-[3.75rem] sm:top-0 left-0 p-2 sm:pl-[4.5rem] w-full pointer-events-none">
      <div className="w-full sm:w-[300px] p-3 flex flex-col bg-glass rounded-lg backdrop-blur-xl pointer-events-auto">
        <input
          className="unstyled text-xl px-2 py-1 rounded bg-transparent duration-300 hover:bg-glass focus:bg-glass"
          value={title}
          onChange={handleTitleChange}
          data-tooltip-id="app-tooltip"
          data-tooltip-content="Title"
          data-tooltip-place="right"
        />
        <input
          className="unstyled px-2 py-1 rounded bg-transparent duration-300 hover:bg-glass focus:bg-glass"
          value={description}
          onChange={handleDescriptionChange}
          data-tooltip-id="app-tooltip"
          data-tooltip-content="Description"
          data-tooltip-place="right"
        />
        {trackList.length > 0 && (
          <>
            <div className="flex flex-row justify-between items-center gap-3 mt-2">
              <button className="flex flex-row items-center flex-1" onClick={handleCollapse}>
                <MdArrowDropDown
                  className={`text-2xl transform transition-transform duration-300 ${collapsed ? "-rotate-90" : "rotate-0"
                    }`}
                />
                <div className="font-bold leading-[0]">Playlist ({trackList.length})</div>
              </button>
              {sphere?.playlistId ? (
                <button className="button light sm" onClick={handleUpdatePlaylist}>
                  Update playlist
                </button>
              ) : (
                <button className="button light sm" onClick={handleCreatePlaylist}>
                  Create playlist
                </button>
              )}
              {sphere?.playlistUrl && (
                <Link className="text-xl" to={sphere.playlistUrl}><MdOutlineOpenInNew /></Link>
              )}
            </div>
            <div
              ref={contentRef}
              style={{
                maxHeight: collapsed ? "0px" : `${contentHeight}px`,
                opacity: collapsed ? 0 : 1,
                marginTop: collapsed ? 0 : "0.75rem",
              }}
              className="flex flex-col gap-3 overflow-y-auto scrollbar-slim transition-all duration-300 ease-in-out pr-2"
            >
              {trackList.map((track, index) => (
                <div className="flex flex-row justify-start items-center gap-3" key={index}>
                  <a className="w-12" href={track.album.url} target="_blank">
                    <img
                      className="w-12 h-12 bg-lighter rounded"
                      src={track.album.image}
                      alt={track.album.name}
                    />
                  </a>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <a
                      className="leading-[1.25] whitespace-nowrap text-ellipsis overflow-hidden hover:underline"
                      href={track.url}
                      target="_blank"
                    >
                      {track.name}
                    </a>
                    <a
                      className="leading-[1.25] whitespace-nowrap text-ellipsis overflow-hidden hover:underline opacity-60"
                      href={track.artists[0].url}
                      target="_blank"
                    >
                      {track.artists[0].name}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
