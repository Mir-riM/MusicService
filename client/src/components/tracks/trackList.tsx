import { ITrack } from "../../types/entries/track";
import TrackItem from "./trackItem/trackItem";

interface ListTracksProps {
  tracks: ITrack[];
}

const ListTracks = ({ tracks }: ListTracksProps) => {
  return (
    <div className="flex flex-col gap-4">
      {tracks.map((track) => (
        <TrackItem key={track._id} currentPlaylist={tracks} track={track} />
      ))}
    </div>
  );
};

export default ListTracks;
