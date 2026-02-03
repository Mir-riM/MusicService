"use client";
import { Button, Tab, Tabs, TextField } from "@mui/material";
import { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useLoginMutation, useRegisterMutation } from "../../api/auth";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "../../hooks/store";
import { setUserState } from "../../store/slices/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthForm, AuthFormSchema } from "./authFormSchema";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { applyApiErrorToForm } from "../../shared/errors/apply-api-error-to-form";
import { parseApiError } from "../../shared/errors/parse-api-error";

const AuthPage = () => {
  const [loginQuery, { isLoading: isLoadingLogin }] = useLoginMutation();
  const [registerQuery, { isLoading: isLoadingRegister }] =
    useRegisterMutation();

  const router = useRouter();

  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState("login");

  const {
    register: authForm,
    handleSubmit: authHandleSubmit,
    formState: { errors: authErrors, isValid: authIsValid },
    setError: setAuthRequestError,
    reset,
    clearErrors,
  } = useForm<AuthForm>({
    resolver: zodResolver(AuthFormSchema),
    mode: "onChange",
  });

  function handleChangeActiveTab(
    event: React.SyntheticEvent,
    newValue: string,
  ) {
    setActiveTab(newValue);
    clearErrors();
    reset();
  }

  async function loginRequest(data: AuthForm) {
    try {
      const result = await loginQuery({
        login: data.login,
        password: data.password,
      }).unwrap();

      dispatch(setUserState(result));
      router.push("/");
    } catch (error) {
      const apiError = parseApiError(error);

      if (apiError) {
        applyApiErrorToForm<AuthForm>(apiError, setAuthRequestError);
      }
    }
  }

  async function registerRequest(data: AuthForm) {
    try {
      const result = await registerQuery({
        login: data.login,
        password: data.password,
      }).unwrap();

      dispatch(setUserState(result));
      router.push("/");
    } catch (error) {
      const apiError = parseApiError(error);

      if (apiError) {
        applyApiErrorToForm<AuthForm>(apiError, setAuthRequestError);
      }
    }
  }

  return (
    <MainLayout>
      <div className="p-6 m-auto w-fit rounded-xl bg-zinc-800/80 border border-zinc-700/50">
        <Tabs value={activeTab} onChange={handleChangeActiveTab}>
          <Tab value="login" label="Войти" wrapped />
          <Tab value="register" label="Зарегистрироваться" />
        </Tabs>

        {activeTab === "login" && (
          <form
            onSubmit={authHandleSubmit(loginRequest)}
            className="flex gap-5 flex-col mt-10"
          >
            <TextField
              {...authForm("login")}
              placeholder="username"
              error={!!authErrors.login}
              helperText={authErrors.login?.message}
            />
            <TextField
              {...authForm("password")}
              placeholder="password"
              type="password"
              error={!!authErrors.password}
              helperText={authErrors.password?.message}
            />
            {authErrors.root && (
              <div className="text-red-500 text-sm">
                {authErrors.root.message}
              </div>
            )}
            <Button disabled={!authIsValid || isLoadingLogin} type="submit">
              Войти
            </Button>
          </form>
        )}
        {activeTab === "register" && (
          <form
            onSubmit={authHandleSubmit(registerRequest)}
            className="flex gap-5 flex-col mt-10"
          >
            <TextField
              placeholder="username"
              {...authForm("login")}
              error={!!authErrors.login}
              helperText={authErrors.login?.message}
            />
            <TextField
              placeholder="password"
              type="password"
              {...authForm("password")}
              error={!!authErrors.password}
              helperText={authErrors.password?.message}
            />
            {authErrors.root && (
              <div className="text-red-500 text-sm">
                {authErrors.root.message}
              </div>
            )}
            <Button disabled={!authIsValid || isLoadingRegister} type="submit">
              Зарегистрироваться
            </Button>
          </form>
        )}
      </div>
    </MainLayout>
  );
};

export default AuthPage;
