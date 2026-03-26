---
description: A structured debugging process to identify and fix crashes or warnings.
---
# Workflow: Debug Issue

**Description**: A scientific method for resolving bugs.

### Steps:
1.  **Isolate**: Identify the exact filename and component causing the crash/warning.
2.  **Analyze Logs**: Read the error message *carefully*.
    *   *Keywords*: look for "undefined", "invariant violation", "syntax error".
3.  **Diff**: If the code worked before, ask "What changed?"
4.  **Hypothesize**: Formulate a theory.
    *   *Example*: "I added an animated style but didn't use `Animated.View`."
5.  **Fix**: Apply the specific fix.
6.  **Verify**:
    *   Run `npx tsc --noEmit path/to/file` to check for type errors.
    *   Ask the user to reload the app.
