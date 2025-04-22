import type { GitChangeEventCountLabel, GitChangeEventType, GitDiff } from './type.ts';
import { GitChangeEvent } from './constant.ts';

export const getGitChangeEvent = (diff: GitDiff): GitChangeEventType => {
  try {
    if (diff.new_file) {
      return GitChangeEvent.Added;
    }
    if (diff.deleted_file) {
      return GitChangeEvent.Deleted;
    }
    if (diff.renamed_file) {
      return GitChangeEvent.Renamed;
    }
    if (diff.diff && diff.diff.length > 0) {
      return GitChangeEvent.Modified;
    } else if (diff.a_mode !== diff.b_mode) {
      return GitChangeEvent.ModeChanged;
    }
    return GitChangeEvent.Unknown;
  } catch {
    return GitChangeEvent.Unknown;
  }
};

export const getEventLabels = (diff: GitDiff[]): GitChangeEventCountLabel[] => {
  const actionMap = new Map<GitChangeEventType, number>();
  diff.map((d) => {
    return getGitChangeEvent(d);
  }).sort((a, b) => a.localeCompare(b)).forEach((a) => {
    const v = actionMap.get(a);
    if (v) {
      actionMap.set(a, v + 1);
    } else {
      actionMap.set(a, 1);
    }
  });
  let newarr: any[] = [];
  actionMap.forEach((v, k) => {
    newarr = [
      ...newarr, {
        title: k,
        action: k,
        value: v,
      },
    ];
  });
  return newarr;
};
