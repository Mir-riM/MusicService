import { ICONS } from "./icon-registry";

type IconProps = {
  muiName: keyof typeof ICONS;
};

export const CustomIcon = ({ muiName }: IconProps) => {
  const MuiIcon = ICONS[muiName];

  if (!MuiIcon) return null;

  return <MuiIcon />;
};
