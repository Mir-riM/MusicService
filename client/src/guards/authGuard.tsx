import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { useRef, useEffect } from "react";
import { useAppSelector } from "../hooks/store";
import { selectAuthInitialized, selectIsAuth } from "../store/slices/auth";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const isAuth = useAppSelector(selectIsAuth);
  const isInitialized = useAppSelector(selectAuthInitialized);
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const notifiedRef = useRef(false);

  useEffect(() => {
    if (!isInitialized || isAuth) return;
    if (notifiedRef.current) return;

    notifiedRef.current = true;
    enqueueSnackbar("Необходимо авторизоваться", { variant: "warning" });
    router.replace("/auth");
  }, [isAuth, isInitialized, enqueueSnackbar, router]);

  if (!isInitialized || !isAuth) return null;

  return <>{children}</>;
};
