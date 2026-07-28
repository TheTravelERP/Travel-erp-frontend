// src/features/settings/notificationTemplates/components/RichTextEditor.tsx
//
// Minimal contentEditable-based HTML editor for the Email template body — no
// rich-text library exists yet in this codebase, and pulling one in for a
// single field is more than this needs. Supports bold/italic/underline/
// bullet & numbered lists/link via the browser's own editing commands.

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Box, IconButton, Paper, Stack, Tooltip } from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import LinkIcon from "@mui/icons-material/Link";
import { useTranslation } from "react-i18next";

export interface RichTextEditorHandle {
  insertText: (text: string) => void;
}

interface Props {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
}

const RichTextEditor = forwardRef<RichTextEditorHandle, Props>(({ value, onChange, minHeight = 220 }, ref) => {
  const { t } = useTranslation();
  const editorRef = useRef<HTMLDivElement>(null);

  // Only sync external value into the DOM when the editor isn't focused —
  // otherwise every keystroke's onChange->prop->effect round-trip would
  // reset the caret position.
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (document.activeElement !== el && el.innerHTML !== (value || "")) {
      el.innerHTML = value || "";
    }
  }, [value]);

  useImperativeHandle(ref, () => ({
    insertText: (text: string) => {
      const el = editorRef.current;
      if (!el) return;
      el.focus();
      document.execCommand("insertText", false, text);
      onChange(el.innerHTML);
    },
  }));

  function exec(command: string, arg?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }

  function handleLink() {
    const url = window.prompt(t("notificationTemplate.enterLinkUrl") || "Enter URL");
    if (url) exec("createLink", url);
  }

  return (
    <Paper variant="outlined">
      <Stack direction="row" spacing={0.5} sx={{ p: 0.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <Tooltip title={t("notificationTemplate.bold")}>
          <IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")}>
            <FormatBoldIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("notificationTemplate.italic")}>
          <IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("italic")}>
            <FormatItalicIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("notificationTemplate.underline")}>
          <IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("underline")}>
            <FormatUnderlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("notificationTemplate.bulletList")}>
          <IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertUnorderedList")}>
            <FormatListBulletedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("notificationTemplate.numberedList")}>
          <IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertOrderedList")}>
            <FormatListNumberedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("notificationTemplate.insertLink")}>
          <IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={handleLink}>
            <LinkIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Box
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        sx={{
          minHeight,
          p: 1.5,
          outline: "none",
          fontSize: 14,
          "& p": { margin: 0 },
        }}
      />
    </Paper>
  );
});

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
