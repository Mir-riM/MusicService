"use client";

import { useRef, useState } from "react";

type FileUploadProps = {
  value: File | null;
  onChange: (file: File | null) => void;
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
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      <div onClick={() => ref.current?.click()}>{children}</div>
    </>
  );
};

export default FileUpload;
