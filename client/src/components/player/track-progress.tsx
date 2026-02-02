"use client";

type TrackProgressProps = {
  left: number;
  right: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  minutesSeconds?: boolean;
};

const TrackProgress: React.FC<TrackProgressProps> = ({
  left,
  right,
  onChange,
  minutesSeconds = false,
}) => {
  return (
    <div className="flex items-center gap-2">
      <input
        max={right}
        min={0}
        value={left}
        onChange={onChange}
        type="range"
        className="w-24 sm:w-32 accent-zinc-400"
      />
      <div className="pl-1 min-w-[4rem]">
        <p className="grid grid-cols-[1fr_auto_1fr] text-center text-sm text-zinc-400">
          <span>
            {minutesSeconds
              ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`
              : left}
          </span>
          <span>&nbsp;/&nbsp;</span>
          <span>
            {minutesSeconds
              ? `${Math.floor(right / 60)}:${String(right % 60).padStart(2, "0")}`
              : right}
          </span>
        </p>
      </div>
    </div>
  );
};

export default TrackProgress;
