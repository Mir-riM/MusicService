"use client";

import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { ITrack } from "../../../types/entries/track";
import { useAppSelector } from "../../../hooks/store";
import { useEffect } from "react";
import { useLikeTrackMutation } from "../../../api/tracks";
import { parseApiError } from "../../../shared/errors/parse-api-error";
import { enqueueSnackbar } from "notistack";

export type LikeButtonTrackProps = {
  track: ITrack;
};

const LikeButtonTrack = ({ track }: LikeButtonTrackProps) => {
  const { user, initialized, userLikedTracks } = useAppSelector(
    (store) => store.auth,
  );

  const [likeTrackRequest, { isLoading }] = useLikeTrackMutation();

  useEffect(() => {
    if (initialized) return;
  }, [user, initialized]);

  async function likeTrackHandler() {
    try {
      await likeTrackRequest({
        trackId: track._id,
      }).unwrap();
    } catch (error) {
      const apiError = parseApiError(error);

      enqueueSnackbar(
        `Произошла ошибка: ${apiError?.message || "Неизвестная ошибка"}`,
        {
          variant: "error",
        },
      );
    }
  }

  return (
    <>
      {user && (
        <div>
          <IconButton disabled={isLoading} onClick={() => likeTrackHandler()}>
            {userLikedTracks?.some(
              (likedTrack) => likedTrack.trackId == track._id,
            ) ? (
              <Favorite />
            ) : (
              <FavoriteBorder />
            )}
          </IconButton>
        </div>
      )}
    </>
  );
};

export default LikeButtonTrack;
