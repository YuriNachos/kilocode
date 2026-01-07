---
"kilo-code": patch
---

Remove unused ContinueCompletionProvider and NextEdit code

This removes the ContinueCompletionProvider class and all its dependencies that are no longer used by our codebase. The GhostInlineCompletionProvider is our active autocomplete implementation.

Removed files:

- ContinueCompletionProvider and its test
- GhostTextAcceptanceTracker (only used by ContinueCompletionProvider)
- statusBar.ts (only used by ContinueCompletionProvider)
- activation folder (JumpManager, NextEditWindowManager, SelectionChangeManager)
- util folder (errorHandling, util, workspaceConfig)
- Entire nextEdit folder (NextEditProvider, NextEditLoggingService, PrefetchQueue, etc.)
- autodetect.ts (modelSupportsNextEdit function)

Also cleaned up index.d.ts by removing unused NextEdit-related types:

- IAutocompleteNextEditLLM interface
- RangeInFileWithNextEditInfo interface
- nextEdit property from ModelCapability
