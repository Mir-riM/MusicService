"use client";

import { useRef, useState } from "react";

type FileUploadProps = {
  setFile: Function;
  accept: string;
  children?: React.ReactNode;
};

const FileUpload = ({ setFile, accept, children }: FileUploadProps) => {
  const ref = useRef<HTMLInputElement>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile);
  }

  return (
    <div
      onClick={() => {
        ref.current?.click();
      }}
    >
      <input
        onChange={onChange}
        className="hidden"
        type="file"
        accept={accept}
        ref={ref}
      />
      {children}
    </div>
  );
};

export default FileUpload;
