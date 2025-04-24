import type { GitChangeEvent } from './constant.ts';
import { GitDiff } from "../common/type.ts";

export type GitChangeEventType = typeof GitChangeEvent[keyof typeof GitChangeEvent];

export type GitChangeEventCountLabel = { title?: string; action: GitChangeEventType; value: number };
// Added: new_file: true
// Deleted: deleted_file: true
// Renamed: renamed_file: true (종종 내용 변경 modified를 동반합니다)
// Modified: 위의 경우가 아니면서 diff 필드에 변경 내용이 있는 경우
// Mode Changed: 위의 경우가 아니면서 a_mode != b_mode 이고 diff 내용이 없는 경우 (Modified의 특수 케이스)

export type CommitFileViewState = {
  diffs?: GitDiff[];
  isLoading: boolean;
  isError: boolean;
};

export type CommitFileViewType = {
  handlePathClick?: (item: GitDiff | null) => void;
} & CommitFileViewState;
