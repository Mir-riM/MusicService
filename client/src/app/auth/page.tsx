"use client";
import { Button, Input, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useLoginMutation, useRegisterMutation } from "../../api/auth";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "../../hooks/store";
import { logout, setUserState } from "../../store/slices/auth";

const AuthPage = () => {
  const router = useRouter();

  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState("auth");

  const [usernameRegister, setUsernameRegister] = useState("");
  const [usernameLogin, setUsernameLogin] = useState("");
  const [passwordRegister, setPasswordRegister] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");

  function handleChangeActiveTab(
    event: React.SyntheticEvent,
    newValue: string,
  ) {
    setActiveTab(newValue);
    setUsernameRegister("");
    setUsernameLogin("");
    setPasswordRegister("");
    setPasswordLogin("");
  }

  const [loginQuery, { isLoading: isLoadingLogin }] = useLoginMutation();
  const [registerQuery, { isLoading: isLoadingRegister }] =
    useRegisterMutation();

  async function loginRequest() {
    try {
      const result = await loginQuery({
        login: usernameLogin,
        password: passwordLogin,
      }).unwrap();

      dispatch(setUserState(result));
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  }

  async function registerRequest() {
    try {
      const result = await registerQuery({
        login: usernameRegister,
        password: passwordRegister,
      }).unwrap();

      dispatch(setUserState(result));
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <MainLayout>
      <div className="p-6 m-auto w-fit rounded-xl bg-zinc-800/80 border border-zinc-700/50">
        <Tabs value={activeTab} onChange={handleChangeActiveTab}>
          <Tab value="auth" label="Войти" wrapped />
          <Tab value="register" label="Зарегистрироваться" />
        </Tabs>

        {activeTab === "auth" && (
          <div className="flex gap-5 flex-col mt-10">
            <Input
              value={usernameLogin}
              onChange={(e) => setUsernameLogin(e.target.value)}
              placeholder="username"
            />
            <Input
              value={passwordLogin}
              onChange={(e) => setPasswordLogin(e.target.value)}
              placeholder="password"
            />
            <Button onClick={() => loginRequest()}>Войти</Button>
          </div>
        )}
        {activeTab === "register" && (
          <div className="flex gap-5 flex-col mt-10">
            <Input
              value={usernameRegister}
              onChange={(e) => setUsernameRegister(e.target.value)}
              placeholder="username"
            />
            <Input
              value={passwordRegister}
              onChange={(e) => setPasswordRegister(e.target.value)}
              placeholder="password"
            />
            <Button onClick={() => registerRequest()}>
              Зарегистрироваться
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AuthPage;
