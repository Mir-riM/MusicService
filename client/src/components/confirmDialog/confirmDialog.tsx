"use client";

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  confirmColor?: "primary" | "error" | "inherit" | "secondary" | "success" | "info" | "warning";
};

const ConfirmDialog = ({
  open,
  title,
  description,
  onConfirm,
  onClose,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  loading = false,
  confirmColor = "primary",
}: ConfirmDialogProps) => {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained" disabled={loading}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
