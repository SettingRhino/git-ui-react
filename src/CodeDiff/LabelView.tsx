import type { ReactNode } from 'react';
import type { GitChangeStatusIconType } from './type.ts';
import { IconClosed, IconModified, IconRename, IconUnknown } from '../common/svgs';
import { GitChangeStatusIcon } from './constant.ts';

export const CodeDiffBasicLabelTitle = ({ str, iconStatus }: { str: string; iconStatus: GitChangeStatusIconType }) => {
  if (iconStatus === GitChangeStatusIcon.Renamed) {
    return (
      <div className="code-diff-header-title">
        <IconRename className="renamed icon-item" />
        {str}
      </div>
    );
  }
  if (iconStatus === GitChangeStatusIcon.ModeChanged) {
    return (
      <div className="code-diff-header-title">
        <IconModified className="modechanged icon-item" />
        {str}
      </div>
    );
  }
  return (
    <div className="code-diff-header-title">
      <IconUnknown className="icon-item" />
      {str}
    </div>
  );
};

export const LabelView = ({ content, title, handleClose }: { content: ReactNode; title: ReactNode; handleClose?: () => void }) => {
  return (
    <div className="code-diff-wrap">
      <div className="code-diff-header">
        {title}
        <IconClosed className="code-diff-icon icon-item" onClick={handleClose} />
      </div>
      <div className="code-diff-label-view">
        {content}
      </div>
    </div>
  );
};
