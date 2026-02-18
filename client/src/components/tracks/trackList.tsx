"use client";

import { Button } from "@mui/material";
import React from "react";
import { ITrack } from "../../types/entries/track";
import { useDebounce } from "../../hooks/useDebounce";
import SearchInput from "../searchInput/searchInput";
import TrackItem from "./trackItem/trackItem";

interface ListTracksProps {
  tracks: ITrack[];
  searchEnabled?: boolean;
  searchTracks?: ITrack[];
}

const ListTracks = ({
  tracks,
  searchEnabled = true,
  searchTracks,
}: ListTracksProps) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const searchBaseTracks = searchTracks ?? tracks;
  const normalizedQuery = debouncedSearchQuery.trim().toLowerCase();

  const filteredTracks = React.useMemo(() => {
    if (!searchEnabled || normalizedQuery.length === 0) {
      return tracks;
    }

    return searchBaseTracks.filter((track) => {
      return (
        track.name.toLowerCase().includes(normalizedQuery) ||
        track.author.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [searchEnabled, normalizedQuery, searchBaseTracks, tracks]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      {searchEnabled && (
        <div className="mb-5">
          <SearchInput value={searchQuery} onChange={handleSearchChange} />
        </div>
      )}

      {filteredTracks.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filteredTracks.map((track) => (
            <TrackItem
              key={track._id}
              currentPlaylist={filteredTracks}
              track={track}
            />
          ))}
        </div>
      ) : searchEnabled && normalizedQuery.length > 0 ? (
        <div>
          <p className="text-zinc-400">
            Треки по запросу: {debouncedSearchQuery} не найдены.
          </p>
          <Button
            onClick={() => setSearchQuery("")}
            variant="outlined"
            size="small"
          >
            Отменить поиск
          </Button>
        </div>
      ) : (
        <div className="text-zinc-400">Треки не найдены</div>
      )}
    </>
  );
};

export default ListTracks;
