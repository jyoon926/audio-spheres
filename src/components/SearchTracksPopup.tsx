import { useCallback, useEffect, useRef, useState } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import { useDebounce } from "use-debounce";
import { convertTrack, Track } from "../utils/Types";

interface Props {
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs;
  onClose: () => void;
  onSelected: (track: Track) => void;
}

export default function SearchTracksPopup({ spotifyApi, onSelected, onClose }: Props) {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SpotifyApi.TrackObjectFull[]>([]);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
  const [debouncedQuery] = useDebounce(query, 300);
  const divRef = useRef<HTMLDivElement>(null);

  const searchTracks = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setLoadingSearch(true);
      spotifyApi
        .searchTracks(searchQuery, { limit: 5 })
        .then((data) => {
          setResults(data.tracks.items);
          setLoadingSearch(false);
        })
        .catch((error) => {
          console.error("Error searching tracks:", error);
          setResults([]);
          setLoadingSearch(false);
        });
    },
    [spotifyApi]
  );

  useEffect(() => {
    searchTracks(debouncedQuery);
  }, [debouncedQuery]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.trim()) {
      setLoadingSearch(true);
    } else {
      setResults([]);
      setLoadingSearch(false);
    }
    setQuery(e.target.value);
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    (e.target as HTMLInputElement).focus();
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (divRef.current && !divRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-80 p-2 flex flex-col gap-2 justify-start items-start bg-glass backdrop-blur-2xl rounded-lg" style={{ zIndex: 10000 }} onClick={handleInputClick} ref={divRef}>
      <div className="w-full flex flex-row items-center gap-2">
        <input
          className="flex grow"
          type="text"
          placeholder="Search..."
          value={query}
          onChange={handleQueryChange} />
        {loadingSearch && <div className="spinner" />}
      </div>
      {results.length > 0 && (
        <div className="flex flex-col w-full">
          {results.map((result) => (
            <button
              className="flex flex-row w-full justify-start items-center gap-3 duration-300 rounded-lg p-2 hover:bg-lightest overflow-hidden"
              key={result.id}
              onClick={() => onSelected(convertTrack(result))}
            >
              <img
                className="w-12 h-12 bg-lighter rounded"
                src={result.album?.images[0].url}
                alt={result.album?.images[0].url}
              />
              <div className="w-full overflow-hidden flex flex-col justify-start items-start">
                <div className="w-full leading-[1.3] whitespace-nowrap text-ellipsis overflow-x-hidden text-left">
                  {result.name}
                </div>
                <div className="w-full leading-[1.3] whitespace-nowrap text-ellipsis overflow-x-hidden text-left opacity-60">
                  {result.artists[0].name}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}