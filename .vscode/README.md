# VS Code Workspace Settings

## Shared Settings

The `settings.json` file includes configurations that are beneficial for the entire team. These may include:

- JSON schema definitions for validating and providing IntelliSense for specific JSON files.

## Local Settings

Developers can create a `settings.local.json` file for personal settings that should not be shared with the team. This file is ignored by Git to prevent it from being committed to the repository.

Example: `settings.local.json`
```json
{
    "editor.formatOnSave": true
}
```