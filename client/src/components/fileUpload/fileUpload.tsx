"use client";

import { useRef, useState } from "react";

type FileUploadProps = {
  value: File | undefined;
  onChange: (file: File | undefined) => void;
  accept: string;
  children: React.ReactNode;
};

const FileUpload = ({ value, onChange, accept, children }: FileUploadProps) => {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={ref}
        type="file"
        hidden
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] ?? undefined)}
      />
      <div onClick={() => ref.current?.click()}>{children}</div>
    </>
  );
};

export default FileUpload;
