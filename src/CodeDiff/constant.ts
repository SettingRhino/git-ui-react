export const CodeViewMode = {
  Changed: 'Changed',
  Added: 'Added',
  Label: 'Label',
  Unknown: 'Unknown',
} as const;

export const GitChangeStatusIcon = {
  Renamed: 'Renamed',
  ModeChanged: 'ModeChanged',
  Unknown: 'Unknown',
} as const;

export const DiffViewMode = {
  Split: 'Split',
  Inline: 'Inline',
  File: 'File',
} as const;

export const FileMode = {
  Hunk: 'Hunk',
  Original: 'Original',
} as const;
