import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";
import {
  ClickAwayListener,
  Collapse,
  Grow,
  IconButton,
  Paper,
  Popper,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Add, Check, ChevronRight, Delete } from "@mui/icons-material";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import ExpandMore from "../../expandMore/expandMore";
import {
  useGetPlaylistTrackLinkQuery,
  useToggleTrackInPlaylistMutation,
} from "../../../api/playlists";
import { useDeleteTrackMutation } from "../../../api/tracks";
import { useAppSelector } from "../../../hooks/store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseApiError } from "../../../shared/errors/parse-api-error";
import { enqueueSnackbar } from "notistack";
import { ApiError } from "../../../types/errors/apiError.types";
import { ITrack } from "../../../types/entries/track";
import { UserRole } from "../../../types/entries/user";
import ConfirmDialog from "../../confirmDialog/confirmDialog";

export type TrackMenuProps = {
  track: ITrack;
};

export default function TrackMenu({ track }: TrackMenuProps) {
  const router = useRouter();

  const { user, initialized } = useAppSelector((store) => store.auth);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [playlistAnchor, setPlaylistAnchor] =
    React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const playlistOpen = Boolean(playlistAnchor);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setPlaylistAnchor(null);
  };

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.replace("/auth");
    }
  }, [initialized, user, router]);

  const {
    data: playlistTrackLink,
    isLoading: playlistTrackLinkRequestIsLoading,
  } = useGetPlaylistTrackLinkQuery(undefined, {
    skip: !user?._id,
  });

  const [
    toggleTrackInPlaylistRequest,
    {
      isLoading: toggleTrackInPlaylistRequestIsLoading,
      error: toggleTrackInPlaylistRequestError,
    },
  ] = useToggleTrackInPlaylistMutation();
  const [deleteTrackRequest, { isLoading: deleteTrackRequestIsLoading }] =
    useDeleteTrackMutation();

  const canDeleteTrack = Boolean(
    user &&
      (track.ownerId === user._id ||
        user.roles.includes(UserRole.ADMIN) ||
        user.roles.includes(UserRole.MODERATOR)),
  );

  const [expanded, setExpanded] = React.useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);

  const handleExpandClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  async function toggleTrackInPlaylistsHandler(playlistId: string) {
    try {
      await toggleTrackInPlaylistRequest({
        playlistId,
        trackId: track._id,
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

  async function deleteTrackHandler() {
    try {
      await deleteTrackRequest(track._id).unwrap();
      handleClose();
      setConfirmDeleteOpen(false);
      enqueueSnackbar("Трек удален", { variant: "info" });
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
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slots={{ transition: Fade }}
        slotProps={{
          list: {
            "aria-labelledby": "fade-button",
          },
        }}
      >
        <MenuItem
          onMouseEnter={(e) => setPlaylistAnchor(e.currentTarget)}
          onClick={(e) => setPlaylistAnchor(e.currentTarget)}
          className="flex justify-between"
        >
          <div className="flex items-center gap-2">
            <PlaylistAddIcon />
            Добавить в плейлист
            <ChevronRight />
          </div>
        </MenuItem>

        {canDeleteTrack && (
          <MenuItem
            className="flex gap-2"
            disabled={deleteTrackRequestIsLoading}
            onClick={() => {
              setConfirmDeleteOpen(true);
            }}
          >
            <Delete fontSize="small" />
            Удалить трек
          </MenuItem>
        )}
      </Menu>

      <Popper
        open={playlistOpen}
        anchorEl={playlistAnchor}
        placement="right-start"
        transition
        modifiers={[
          {
            name: "offset",
            options: {
              offset: [8, 0], // отступ вправо
            },
          },
        ]}
        sx={{
          zIndex: 2000, // выше чем Menu
        }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} timeout={150}>
            <Paper
              sx={{
                minWidth: 260,
                maxHeight: "60vh",
                overflowY: "auto",
                boxShadow: 8,
                borderRadius: 1,
              }}
            >
              <MenuItem
                onClick={() => {
                  setPlaylistAnchor(null);
                  handleClose();
                  router.push("/playlists/create");
                }}
              >
                <Add sx={{ mr: 1 }} />
                Создать плейлист
              </MenuItem>

              {playlistTrackLinkRequestIsLoading && (
                <MenuItem disabled>
                  <Typography variant="body2">Загрузка...</Typography>
                </MenuItem>
              )}

              {!playlistTrackLinkRequestIsLoading &&
                playlistTrackLink?.map((playlist) => (
                  <MenuItem
                    key={playlist._id}
                    onClick={() => {
                      toggleTrackInPlaylistsHandler(playlist._id);
                      setPlaylistAnchor(null);
                    }}
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span
                      style={{
                        maxWidth: 180,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {playlist.name}
                    </span>

                    {playlist.tracks.some(
                      (playlistTrack) => playlistTrack.trackId === track._id,
                    ) && <Check />}
                  </MenuItem>
                ))}
            </Paper>
          </Grow>
        )}
      </Popper>
      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Удалить трек?"
        description="Вы уверены, что хотите удалить трек? Это действие нельзя отменить."
        onConfirm={deleteTrackHandler}
        onClose={() => setConfirmDeleteOpen(false)}
        confirmText="Удалить"
        cancelText="Отмена"
        loading={deleteTrackRequestIsLoading}
        confirmColor="error"
      />
    </div>
  );
}
