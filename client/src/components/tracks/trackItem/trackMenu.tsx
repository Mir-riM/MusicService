import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";
import { Collapse, IconButton, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Add, Check, Delete } from "@mui/icons-material";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import ExpandMore from "../../expandMore/expandMore";
import {
  useGetPlaylistTrackLinkQuery,
  useToggleTrackInPlaylistMutation,
} from "../../../api/playlists";
import { useAppSelector } from "../../../hooks/store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseApiError } from "../../../shared/errors/parse-api-error";
import { enqueueSnackbar } from "notistack";
import { ApiError } from "../../../types/errors/api-error.types";
import { ITrack } from "../../../types/entries/track";

export type TrackMenuProps = {
  track: ITrack;
};

export default function TrackMenu({ track }: TrackMenuProps) {
  const router = useRouter();

  const { user, initialized } = useAppSelector((store) => store.auth);

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.replace("/auth");
    }
  }, [initialized, user, router]);

  const {
    data: playlistTrackLink,
    isLoading: playlistTrackLinkRequestIsLoading,
  } = useGetPlaylistTrackLinkQuery(user?._id ?? "", {
    skip: !user?._id,
  });

  const [
    toggleTrackInPlaylistRequest,
    {
      isLoading: toggleTrackInPlaylistRequestIsLoading,
      error: toggleTrackInPlaylistRequestError,
    },
  ] = useToggleTrackInPlaylistMutation();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  async function toggleTrackInPlaylistsHandler(playlistId: string) {
    try {
      await toggleTrackInPlaylistRequest({
        playlistId,
        trackId: track._id,
        userId: user!._id,
      }).unwrap();

      setExpanded(false);
    } catch (error) {
      let apiError: ApiError | null | { message: string } =
        parseApiError(error);

      if (!apiError) {
        apiError = { message: "Неизвестная ошибка" };
      }
      enqueueSnackbar(`Произошла ошибка: ${apiError?.message}`, {
        variant: "error",
      });
    }
  }

  return (
    <div>
      <IconButton
        id="fade-button"
        aria-controls={open ? "fade-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="fade-menu"
        slotProps={{
          list: {
            "aria-labelledby": "fade-button",
          },
        }}
        slots={{ transition: Fade }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem className="flex flex-col" onClick={handleExpandClick}>
          <div className="flex items-center gap-2">
            <PlaylistAddIcon />
            <p>Добавить в плейлист</p>

            <ExpandMore
              expanded={expanded}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
              className="ml-auto"
            />
          </div>
        </MenuItem>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          {playlistTrackLinkRequestIsLoading && (
            <Typography variant="body2" color="textSecondary">
              Загрузка плейлистов...
            </Typography>
          )}

          {!playlistTrackLinkRequestIsLoading && (
            <div className="py-2 bg-zinc-800">
              <MenuItem
                onClick={() => router.push("/playlists/create")}
                className="flex gap-2"
              >
                <Add />
                Добавить плейлист
              </MenuItem>
              {playlistTrackLink?.map((playlist, index) => (
                <MenuItem
                  onClick={() => toggleTrackInPlaylistsHandler(playlist._id)}
                  key={index}
                  className="flex gap-2 justify-between w-full"
                >
                  <Typography
                    noWrap
                    sx={{
                      maxWidth: 200,
                    }}
                  >
                    {playlist.name}
                  </Typography>
                  {playlist.tracks.some(
                    (playlistTrack) => playlistTrack.trackId === track._id,
                  ) && <Check />}
                </MenuItem>
              ))}
            </div>
          )}
        </Collapse>

        <MenuItem className="flex gap-2" onClick={handleClose}>
          <Delete fontSize="small" />
          <p>Удалить трек</p>
        </MenuItem>
      </Menu>
    </div>
  );
}
