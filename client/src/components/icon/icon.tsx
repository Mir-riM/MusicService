import { ICONS } from "./iconRegistry";

type IconProps = {
  muiName: keyof typeof ICONS;
};

export const CustomIcon = ({ muiName }: IconProps) => {
  const MuiIcon = ICONS[muiName];

  if (!MuiIcon) return null;

  return <MuiIcon />;
};
