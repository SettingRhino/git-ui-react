import type { GitDiff } from './type.ts';
import { useEffect, useState } from 'react';
import { ChangeEventIcon } from './ChangeEvent.tsx';
import { getGitChangeEvent } from './utils.ts';

export const FilePath = ({ diffs = [], handlePathClick }: { diffs: GitDiff[]; handlePathClick?: (item: GitDiff | null) => void }) => {
  const [activeDiff, setActiveDiff] = useState<{ index: number; diff: GitDiff | null } | null>(null);
  useEffect(() => {
    if (handlePathClick) {
      if (activeDiff && activeDiff.diff) {
        handlePathClick(activeDiff.diff);
      } else {
        handlePathClick(null);
      }
    }
  }, [activeDiff, handlePathClick]);
  return (
    <div className="path_list">
      {diffs.map((item, index) => {
        const click = (item: GitDiff) => {
          setActiveDiff((prevState: { index: number; diff: GitDiff | null } | null) => {
            if (index === prevState?.index) {
              return null;
            }
            return { index, diff: item };
          });
        };
        return (
          <FilePathItem key={`file_${index}_${item?.new_path}`} active={activeDiff?.index === index} handlePathClick={click} item={item} />
        );
      })}
    </div>
  );
};

const FilePathItem = ({ item, handlePathClick, active = false }: { item: GitDiff; handlePathClick?: (item: GitDiff) => void; active?: boolean }) => {
  const gitAction = getGitChangeEvent(item);
  const handleClick = () => {
    if (handlePathClick) {
      handlePathClick(item);
    }
  };
  return (
    <div className={`path-item ${active ? 'active' : ''}`} onClick={handleClick}>
      <ChangeEventIcon action={gitAction} className={`action-icon ${gitAction.toLowerCase()}`} />
      <div className="path-value" title={item.new_path}>{item.new_path}</div>
    </div>
  );
};
