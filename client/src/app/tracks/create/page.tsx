"use client";
import { useState } from "react";
import StepWrapper from "../../../components/step-wrapper/step-wrapper";
import MainLayout from "../../../layouts/MainLayout";
import { Button, Card, Grid, TextField } from "@mui/material";
import FileUpload from "../../../components/file-upload/file-upload";
import { useCreateTrackMutation } from "../../../api/tracks";
import { useRouter } from "next/navigation";
import { AuthGuard } from "../../../guards/authGuard";
import { Controller, useForm } from "react-hook-form";
import { CreateTrackForm, stepSchemas } from "./createTrackFrom";

const CreateTrack = () => {
  const router = useRouter();

  const form = useForm<CreateTrackForm>({
    defaultValues: {
      name: "",
      author: "",
      text: "",
      picture: undefined,
      track: undefined,
    },
    mode: "onChange",
  });

  const [activeStep, setActiveStep] = useState(0);
  const maxStep = 2;

  const [createTrack, { isLoading, error }] = useCreateTrackMutation();

  async function next() {
    const schema = stepSchemas[activeStep];
    const values = form.getValues();

    const result = schema.safeParse(values);

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        form.setError(issue.path[0] as any, {
          type: "manual",
          message: issue.message,
        });
      });
      return;
    }

    setActiveStep((s) => s + 1);
  }

  function prev() {
    if (activeStep !== 0) {
      setActiveStep((prev) => prev - 1);
    } else {
      setActiveStep(0);
    }
  }

  async function onSubmit(data: CreateTrackForm) {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("author", data.author);
    if (data.text) formData.append("text", data.text);
    if (data.picture) formData.append("picture", data.picture);
    if (data.track) formData.append("track", data.track);

    const created = await createTrack(formData).unwrap();
    router.push(`/tracks/${created._id}`);
  }

  return (
    <AuthGuard>
      <MainLayout>
        <header className="mb-10">
          <h2 className="font-semibold text-xl text-center text-zinc-100">
            Создание трека
          </h2>
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
                  {...form.register("name")}
                  error={!!form.formState.errors.name}
                  helperText={form.formState.errors.name?.message}
                />
                <TextField
                  placeholder="Имя автора"
                  {...form.register("author")}
                  error={!!form.formState.errors.author}
                  helperText={form.formState.errors.author?.message}
                />
                <TextField
                  placeholder="Текст трека"
                  {...form.register("text")}
                  error={!!form.formState.errors.text}
                  helperText={form.formState.errors.text?.message}
                  multiline
                  rows={3}
                />
              </div>
            </Card>
          )}
          {activeStep === 1 && (
            <Controller
              control={form.control}
              name="picture"
              render={({ field }) => (
                <div className="text-center">
                  {field.value && (
                    <div>
                      <img
                        className="mx-auto size-32 object-contain"
                        src={URL.createObjectURL(field.value)}
                        alt="Обложка трека"
                      />
                      <p className="text-xs my-5">
                        Загружен файл: {field.value.name}
                      </p>
                    </div>
                  )}

                  <FileUpload
                    accept="image/*"
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <Button>
                      {field.value ? "Обновить обложку" : "Загрузить обложку"}
                    </Button>
                  </FileUpload>
                </div>
              )}
            />
          )}
          {activeStep === 2 && (
            <Controller
              control={form.control}
              name="track"
              render={({ field }) => (
                <div className="text-center">
                  {field.value && (
                    <div>
                      <p className="text-xs my-5">
                        Загружен файл: {field.value.name}
                      </p>
                    </div>
                  )}

                  <FileUpload
                    value={field.value}
                    onChange={field.onChange}
                    accept={"audio/*"}
                  >
                    <Button>
                      {field.value ? "Обновить трек" : "Загрузить трек"}
                    </Button>
                  </FileUpload>
                </div>
              )}
            />
          )}
        </StepWrapper>
        <Grid className="w-full text-center mt-10">
          <Button disabled={activeStep === 0} onClick={() => prev()}>
            Назад
          </Button>
          <Button
            disabled={isLoading}
            onClick={
              activeStep === maxStep ? form.handleSubmit(onSubmit) : next
            }
          >
            {activeStep === maxStep ? "Создать" : "Далее"}
          </Button>
        </Grid>
      </MainLayout>
    </AuthGuard>
  );
};

export default CreateTrack;
