"use client";
import { useState } from "react";
import StepWrapper from "../../../components/step-wrapper/step-wrapper";
import MainLayout from "../../../layouts/MainLayout";
import { Button, Card, Grid, TextField } from "@mui/material";
import FileUpload from "../../../components/file-upload/file-upload";
import { useCreateTrackMutation } from "../../../api/tracks";
import { useRouter } from "next/navigation";

const CreateTrack = () => {
  const router = useRouter();
  const [trackInfo, setTrackInfo] = useState({
    name: "",
    author: "",
    text: "",
  });
  const [activeStep, setActiveStep] = useState(0);
  const [picture, setPicture] = useState<File | null>(null);
  const [track, setTrack] = useState<File | null>(null);
  const maxStep = 2;

  const [createTrack, { isLoading, error }] = useCreateTrackMutation();

  async function next() {
    if (activeStep !== maxStep) {
      setActiveStep((prev) => prev + 1);
    } else {
      try {
        if (track) {
          const createdTrack = await createTrack({
            name: trackInfo.name,
            author: trackInfo.author,
            text: trackInfo.text,
            track,
            picture,
          }).unwrap();

          router.push(`/tracks/${createdTrack._id}`);
        }
      } catch (err) {
        console.error("Ошибка создания трека", err);
      }
    }
  }

  function prev() {
    if (activeStep !== 0) {
      setActiveStep((prev) => prev - 1);
    } else {
      setActiveStep(0);
    }
  }

  return (
    <MainLayout>
      <header className="mb-10">
        <h2 className="font-semibold text-xl text-center text-zinc-100">Создание трека</h2>
      </header>

      <StepWrapper
        activeStep={activeStep}
        stepsHeader={[
          "Информация о треке",
          "Загрузите обложку",
          "Загрузите сам трек",
        ]}
      >
        {activeStep === 0 && (
          <Card className="mx-auto max-w-2xl p-5 flex flex-col gap-5 bg-zinc-800/80 border border-zinc-700/50">
            <div className="flex flex-col gap-4">
              <TextField
                placeholder="Название трека"
                value={trackInfo.name}
                onChange={(e) =>
                  setTrackInfo({ ...trackInfo, name: e.target.value })
                }
              />
              <TextField
                placeholder="Имя автора"
                value={trackInfo.author}
                onChange={(e) =>
                  setTrackInfo({ ...trackInfo, author: e.target.value })
                }
              />
              <TextField
                placeholder="Текст трека"
                value={trackInfo.text}
                onChange={(e) =>
                  setTrackInfo({ ...trackInfo, text: e.target.value })
                }
              />
            </div>
          </Card>
        )}
        {activeStep === 1 && (
          <div className="text-center">
            {picture && (
              <div>
                <img
                  className="mx-auto size-32 object-contain"
                  src={URL.createObjectURL(picture)}
                  alt="Обложка трека"
                />
                <p className="text-xs my-5">Загружен файл: {picture.name}</p>
              </div>
            )}
            <FileUpload setFile={setPicture} accept={"image/*"}>
              <Button>
                {picture ? "Обновить обложку" : "Загрузить обложку"}
              </Button>
            </FileUpload>
          </div>
        )}
        {activeStep === 2 && (
          <div className="text-center">
            {track && (
              <div>
                <p className="text-xs my-5">Загружен файл: {track.name}</p>
              </div>
            )}
            <FileUpload setFile={setTrack} accept={"audio/*"}>
              <Button>{track ? "Обновить трек" : "Загрузить трек"}</Button>
            </FileUpload>
          </div>
        )}
      </StepWrapper>

      <Grid className="w-full text-center mt-10">
        <Button disabled={activeStep === 0} onClick={() => prev()}>
          Назад
        </Button>
        <Button onClick={() => next()}>Далее</Button>
      </Grid>
    </MainLayout>
  );
};

export default CreateTrack;
