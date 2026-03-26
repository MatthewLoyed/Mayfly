---
description: A systematic approach to refactoring code to prevent regression and syntax errors.
---
# Workflow: Refactor Code

**Description**: A safe, step-by-step process for modifying existing code structures.

### Steps:
1.  **Checkpoint**: Ensure the current state is working (or at least understandable).
2.  **Analyze**: Read the *entire* file to understand dependencies, imports, and component structure.
3.  **Plan**: explicitly state what is moving where.
    *   *Example*: "Moving `styles` object to the bottom," or "Extracting `Header` component."
4.  **Execute**: Apply the changes using `replace_file_content` (for small blocks) or `write_to_file` (for full rewrites).
    *   *Rule*: If changing >20% of the file, strongly consider `write_to_file` to avoid "search string not found" errors.
5.  **Verify Syntax**: Immediately run the `syntax` workflow on the modified file.
6.  **Verify Logic**: Check if imports are still valid and no matching braces were lost.
