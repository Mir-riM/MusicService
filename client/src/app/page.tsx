"use client";
import { useAppSelector } from "../hooks/store";
import MainLayout from "../layouts/MainLayout";

export default function Home() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <>
      <MainLayout>
        <div className="text-center h-full flex flex-col justify-center items-center m-auto gap-2">
          <h1 className="text-2xl font-semibold text-zinc-100">Добро пожаловать!</h1>
          {user ? (
            <p className="break-all text-zinc-400">Пользователь: {user.login}</p>
          ) : (
            <p className="text-zinc-400">Гость</p>
          )}
          <p className="text-zinc-500 text-sm">Здесь собраны лучшие треки</p>
        </div>
      </MainLayout>
    </>
  );
}
