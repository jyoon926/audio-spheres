import { useCallback, useEffect, useState } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import { useDebounce } from "use-debounce";
import { convertTrack, Track } from "../utils/Types";

interface Props {
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs;
  onSelected: (track: Track) => void;
}

export default function SearchTracks({ spotifyApi, onSelected }: Props) {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SpotifyApi.TrackObjectFull[]>([]);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
  const [debouncedQuery] = useDebounce(query, 300);

  // const [suggestions, setSuggestions] = useState<SpotifyApi.TrackObjectFull[]>([]);
  // const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(false);

  // useEffect(() => {
  //   const fetchSuggestions = async () => {
  //     setLoadingSuggestions(true);
  //     try {
  //       const topTracksShort = await spotifyApi.getMyTopTracks({
  //         limit: 3,
  //         time_range: "short_term",
  //       });
  //       const topTracksMedium = await spotifyApi.getMyTopTracks({
  //         limit: 3,
  //         time_range: "medium_term",
  //       });
  //       const topTracksLong = await spotifyApi.getMyTopTracks({
  //         limit: 3,
  //         time_range: "long_term",
  //       });
  //       const recentTracksResponse = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 3 });
  //       const combinedTracks = [
  //         ...topTracksShort.items,
  //         ...topTracksMedium.items,
  //         ...topTracksLong.items,
  //         ...recentTracksResponse.items.map((item) => item.track as unknown as SpotifyApi.TrackObjectFull),
  //       ];
  //       const uniqueTracks = combinedTracks.filter(
  //         (track, index, self) => index === self.findIndex((t) => t.id === track.id)
  //       );
  //       setSuggestions(uniqueTracks);
  //     } catch (error) {
  //       console.error("Error fetching suggestions:", error);
  //     } finally {
  //       setLoadingSuggestions(false);
  //     }
  //   };

  //   fetchSuggestions();
  // }, [spotifyApi]);

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

  return (
    <div className="flex flex-col gap-3 w-full justify-start items-start">
      <p className="text-2xl">Choose a song to initialize your sphere.</p>

      {/* Search */}
      <div className="flex flex-col gap-3 w-full justify-start items-start">
        <div className="w-full flex flex-row items-center gap-3">
          <input
            className="w-full"
            type="text"
            placeholder="Search..."
            value={query}
            onChange={handleQueryChange}
          />
          {loadingSearch && <div className="spinner" />}
        </div>
        {results.length > 0 && (
          <div className="flex flex-col w-full">
            {results.map((result) => (
              <button
                className="flex flex-row w-full justify-start items-center gap-3 duration-300 rounded-lg p-2 hover:bg-glass overflow-hidden"
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

      {/* Suggestions */}
      {/* {(loadingSuggestions || suggestions.length > 0) && (
        <div className="flex w-full flex-col gap-3 bg-glass rounded-lg p-3">
          <div className="opacity-50 pt-1">Suggested tracks</div>
          {loadingSuggestions && (
            <div className="w-full flex justify-center items-center h-32">
              <div className="spinner lg" />
            </div>
          )}
          {!loadingSuggestions && suggestions.length > 0 && (
            <div className="w-full grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))" }}>
              {suggestions.map((track) => (
                <button
                  className="flex flex-col justify-start items-start gap-3 duration-300 rounded-lg p-3 hover:bg-glass"
                  key={track.id}
                  onClick={() => onSelected(track)}
                >
                  <img
                    className="w-full bg-lighter rounded"
                    src={track.album?.images[0].url}
                    alt={track.album?.images[0].url}
                  />
                  <div className="flex flex-col w-full justify-start items-start overflow-x-hidden">
                    <div className="w-full leading-[1.3] whitespace-nowrap text-ellipsis overflow-x-hidden text-left">
                      {track.name}
                    </div>
                    <div className="w-full leading-[1.3] whitespace-nowrap text-ellipsis overflow-x-hidden text-left opacity-60">
                      {track.artists[0].name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )} */}
    </div>
  );
}
