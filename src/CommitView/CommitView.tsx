import type { CommitViewType } from './type.ts';
import { useState } from 'react';
import { IconCopy } from '../common/svgs';
import { clipboardCopy, truncateString } from './utils.ts';
import './commitview.css';

const CommitTitle = ({ title = 'Commit:', value = '', className = '' }: { title?: string; value?: string; className?: string }) => {
  const [copyShow, setCopyShow] = useState(false);
  return (
    <div
      className={`commit-title ${className || ''}`}
      title={value}
    >
      <div className="commit-title-text">
        {`${title} ${truncateString(value)}`}
        <div className={`copy-check ${copyShow ? 'show' : ''}`}>Copy </div>
      </div>
      <div
        className="copy"
        onClick={() => {
          clipboardCopy(value).then(() => {
            setCopyShow(true);
            setTimeout(() => setCopyShow(false), 1000);
          });
        }}
      >
        <IconCopy className="copy-icon" />
      </div>
    </div>
  );
};

const CommitMessage = ({ message = '', className = '' }: { message?: string;className?: string }) => {
  return (
    <div className={`commit-message ${className || ''}`}>
      <textarea readOnly className="commit-message-textarea" value={message} />
    </div>
  );
};

const CommitCommitter = ({ className = '', committers = [] }: { className?: string; committers?: { title: string; date?: string; items: { title: string; value: string }[]; id?: string }[] }) => {
  if (!committers || committers.length === 0) {
    return null;
  }
  return (
    <div className={`commit-committer ${className || ''}`}>
      {committers.map((committer, index) => {
        return (
          <div key={committer?.id || `${index}_${committer.title}`}>
            <div className="commit-committer-title-wrapper">
              <div className="commit-committer-title">{committer.title}</div>
              <div>{committer.date}</div>
            </div>
            <div className="commit-committer-items">
              {committer.items.map((item, itemIndex) => {
                return (
                  <div key={`items${itemIndex}_${index}_${committer.title}`}>
                    {`${item.title} ${item.value}`}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {/* Commit Info  - Users */}
    </div>
  );
};

const CommitParents = ({ title = 'Parents', parents = [], className = '', handleParentClick }: { title?: string; parents?: string[]; className?: string; handleParentClick?: (parentId: string) => void }) => {
  if (parents.length === 0 || !parents) {
    return null;
  }

  return (
    <div className={`commit-parents ${className || ''}`}>
      <div className="commit-parents-title">{title}</div>
      <div className="commit-parents-items-wrapper">
        {parents.map((parent) => {
          return (
            <span
              key={parent}
              className="parent-badge"
              onClick={() => {
                if (handleParentClick) {
                  handleParentClick(parent);
                }
              }}
            >
              {truncateString(parent)}
            </span>
          );
        })}
      </div>
    </div>

  );
};

export const CommitView = ({ data, classes }: CommitViewType) => {
  return (
    <div className="commit-view">
      {/* Commit Title */}
      <CommitTitle {...data?.title} className={classes?.title} />
      {/* Commit Message */}
      <CommitMessage {...data?.message} className={classes?.message} />
      {/* Commit Info */}
      <CommitCommitter {...data?.committers} className={classes?.committers} />
      <CommitParents {...data?.parents} className={classes?.parents} />
      {/* </div> */}
    </div>
  );
};
