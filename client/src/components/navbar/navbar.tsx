"use client";
import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "@mui/icons-material";
import { CustomIcon } from "../icon/icon";
import { ICONS } from "../icon/icon-registry";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { Divider } from "@mui/material";
import { logout } from "../../store/slices/auth";

const drawerWidth = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const menuItems: { name: string; path: string; icon: keyof typeof ICONS }[] = [
  { name: "Главная", path: "/", icon: "Home" },
  { name: "Треки", path: "/tracks", icon: "MusicNote" },
  { name: "Добавить трек", path: "/tracks/create", icon: "PlaylistAdd" },
];

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export default function Navbar() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const pathName = usePathname();

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" open={open}>
        <Toolbar className="flex gap-3">
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={[open && { display: "none" }]}
          >
            <MenuIcon />
          </IconButton>
          {pathName !== "/" && (
            <IconButton onClick={() => router.back()} color="inherit">
              <ChevronLeft />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div">
            MusicService
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <List className="flex justify-between flex-col">
          <div>
            {menuItems.map(({ name, path, icon }, index) => (
              <ListItem
                key={index}
                onClick={() => router.push(path)}
                disablePadding
              >
                <ListItemButton>
                  <ListItemIcon>
                    <CustomIcon muiName={icon} />
                  </ListItemIcon>
                  <ListItemText primary={name} />
                </ListItemButton>
              </ListItem>
            ))}
            <Divider />
          </div>

          {user ? (
            <ListItem
              onClick={() => {
                dispatch(logout());
                router.push("/auth");
              }}
              disablePadding
            >
              <ListItemButton>
                <ListItemIcon>
                  <CustomIcon muiName={"ExitToApp"} />
                </ListItemIcon>
                <ListItemText primary={"Выйти"} />
              </ListItemButton>
            </ListItem>
          ) : (
            <ListItem onClick={() => router.push("/auth")} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <CustomIcon muiName={"Login"} />
                </ListItemIcon>
                <ListItemText primary={"Войти"} />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Drawer>
    </Box>
  );
}
