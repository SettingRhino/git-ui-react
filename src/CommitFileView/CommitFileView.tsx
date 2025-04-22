import type {
  CommitFileViewType,
  GitDiff,
} from './type.ts';
import { useEffect } from 'react';
import { IconError, IconLoading } from '../common/svgs';
import { ChangeEventCounts } from './ChangeEvent.tsx';
import { FilePath } from './FilePath.tsx';
import './commit-file-view.css';

const djb2HashCodeKey = (diff: GitDiff[]) => {
  if (!diff || diff.length === 0) {
    return 'none-diff';
  }
  const longStr = diffToLongest(diff);
  let hash = 5381; // 초기값
  for (let i = 0; i < longStr.length; i++) {
    const char = longStr.charCodeAt(i);
    hash = ((hash << 5) + hash) + char; /* hash * 33 + c */
    hash |= 0; // 32비트 정수로 변환
  }
  return hash;
};

const diffToLongest = (diff: GitDiff[]) => {
  let str = '';
  diff.forEach((d) => {
    str = str + `${d.diff}_${d.new_path}_${d.old_path}_${d.a_mode}_${d.b_mode}_${d.new_file}_${d.renamed_file}_${d.deleted_file}`;
  });
  return str;
};

export const CommitFileView = ({ diffs = [], handlePathClick, isLoading = false, isError = false }: CommitFileViewType) => {
  useEffect(() => {
    return () => {
      if (handlePathClick) {
        handlePathClick(null);
      }
    };
  }, []);
  if (isLoading) {
    return (
      <div key="diff-loading" className="commit-file-view">
        <ChangeEventCounts />
        <div className="path_list status-wrapper">
          <IconLoading className="status-icon" />
        </div>
      </div>
    );
  }
  if (isError) {
    return (
      <div key="diff-error" className="commit-file-view">
        <ChangeEventCounts />
        <div className="path_list status-wrapper">
          <IconError className="status-icon" />
        </div>
      </div>
    );
  }
  return (
    <div key={djb2HashCodeKey(diffs)} className="commit-file-view">
      <ChangeEventCounts diffs={diffs} />
      <FilePath diffs={diffs} handlePathClick={handlePathClick} />
    </div>
  );
};
