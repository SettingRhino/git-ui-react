import type {
  GitChangeEventCountLabel,
  GitChangeEventType, GitDiff,
} from './type.ts';
import { useMemo } from 'react';
import { IconAdded, IconDeleted, IconModified, IconRename, IconUnknown } from '../common/svgs';
import { GitChangeEvent } from './constant.ts';
import { getEventLabels } from './utils.ts';

export const ChangeEventIcon = ({ action, className }: { action: GitChangeEventType; className?: string }) => {
  if (action === GitChangeEvent.Added) {
    return <IconAdded className={className || ''} />;
  }
  if (action === GitChangeEvent.ModeChanged) {
    return <IconModified className={className || ''} />;
  }
  if (action === GitChangeEvent.Modified) {
    return <IconModified className={className || ''} />;
  }
  if (action === GitChangeEvent.Deleted) {
    return <IconDeleted className={className || ''} />;
  }
  if (action === GitChangeEvent.Renamed) {
    return <IconRename className={className || ''} />;
  }
  return <IconUnknown className={className || ''} />;
};

const ChangeEventLabel = ({ title, action, value }: GitChangeEventCountLabel) => {
  return (
    <div className="change_event_counts">
      {/* <Icon className={`action-icon ${action.toLowerCase()}`} /> */}
      <ChangeEventIcon action={action} className={`action-icon ${action.toLowerCase()}`} />
      <span className={'change_event_label'} key={`${action}-${value}`}>{`${title || action}: ${value}`}</span>
    </div>

  );
};

export const ChangeEventCounts = ({ diffs = [] }: { diffs?: GitDiff[] }) => {
  const diffActionLabel: GitChangeEventCountLabel[] = useMemo(() => getEventLabels(diffs), [diffs]);
  if (!diffActionLabel || diffActionLabel.length === 0) {
    return (
      <div className="change_event_counts noitems">
        <div className="change_event_counts">
          <IconUnknown className="unknown" />
          Unknown
        </div>
      </div>
    );
  }
  return (
    <div className="change_event_counts">
      {diffActionLabel.map((d, i) => {
        return (
          <ChangeEventLabel {...d} key={`diff-act-${i}-${d?.title}`} />
        );
      })}
    </div>
  );
};
