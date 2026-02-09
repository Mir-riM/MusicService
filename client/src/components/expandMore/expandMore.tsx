import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type ExpandMoreProps = {
  expanded: boolean;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  className?: string;
};

export default function ExpandMore({
  expanded,
  onClick,
  className,
}: ExpandMoreProps) {
  return (
    <span
      onClick={onClick}
      aria-expanded={expanded}
      className={className}
      style={{
        display: "inline-flex",
        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
        cursor: "pointer",
      }}
    >
      <ExpandMoreIcon />
    </span>
  );
}
