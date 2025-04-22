import type { ReactNode } from 'react';
import type { Commit, GitDiff } from '../common/type.ts';
import type { CodeViewMode, GitChangeStatusIcon } from './constant.ts';

export type GetTwoWayOriginFile = () => Promise<{ oldValue: string; newValue: string } | null | undefined>;
export type GetOriginFile = () => Promise<string | null | undefined>;

export type GitChangeStatusIconType = typeof GitChangeStatusIcon[keyof typeof GitChangeStatusIcon];

export type CodeDiffChanged = {
  mode: typeof CodeViewMode.Changed;
  diff: string;
  getOriginFile?: GetTwoWayOriginFile;
  handleClose?: () => void;
};

export type CodeDiffAdded = {
  mode: typeof CodeViewMode.Added;
  diff: string;
  getOriginFile?: GetOriginFile;
  title?: string;
  handleClose?: () => void;
};

export type CodeDiffAlertLabel = {
  mode: typeof CodeViewMode.Label;
  title: ReactNode;
  content: ReactNode;
  handleClose?: () => void;
};

export type CodeDiffUnknownLabel = {
  mode: typeof CodeViewMode.Unknown;
  component: ReactNode;
  handleClose?: () => void;
};

export type CodeDiffType = { diffSetting?: CodeDiffChanged | CodeDiffAdded | CodeDiffAlertLabel | CodeDiffUnknownLabel };

export type CodeViewData = {
  isLoading: boolean;
  isError: boolean;
  data?: {
    newValue: string;
    oldValue: string;
    offset: number;
  };
};

export type ConvertDiffSettingType = (commit?: Commit, diff?: GitDiff, handleClose?: () => void, getOriginFile?: (commitId: string, path: string) => Promise<string | null | undefined>) => CodeDiffChanged | CodeDiffAdded | CodeDiffAlertLabel | CodeDiffUnknownLabel | undefined;
