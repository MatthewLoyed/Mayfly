---
description: Scans the specified file for syntax errors and repairs them using tooling.
---
# Workflow: Fix Syntax

**Description**: Scans the current file for missing braces or syntax errors and repairs them.

### Steps:
1.  **Check Syntax**: Run `npx tsc --noEmit path/to/file.tsx` (for TS/TSX) or `npx eslint path/to/file.js` to identify the exact line of the error.
    *   *Note*: Use `--skipLibCheck` if necessary to ignore node_modules.
2.  **Format Check**: Run `npx prettier --check path/to/file.tsx` to see if formatting is broken (often indicates syntax errors).
3.  **Analyze**: Read the file content around the reported error line. Look specifically for:
    *   Unclosed braces `{` or `}`.
    *   Unclosed tags `<View>` or `</View>`.
    *   Mismatched imports.
4.  **Repair**: Rewrite the specific block (or the whole file if corruption is widespread) to fix the error.
5.  **Verify**: Run `npx prettier --write path/to/file.tsx` to auto-format and confirm validity.
