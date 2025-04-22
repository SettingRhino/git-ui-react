import type { CodeDiffType } from './type.ts';
import { CodeSingleView, CodeView } from './CodeView.tsx';
import { CodeViewMode } from './constant.ts';
import { LabelView } from './LabelView.tsx';
import './codediff.css';

export const CodeDiff = ({ diffSetting }: CodeDiffType) => {
  switch (diffSetting?.mode) {
    case CodeViewMode.Changed: {
      return (
        <CodeView
          {...diffSetting} />
      );
    }
    case CodeViewMode.Added: {
      return <CodeSingleView {...diffSetting} />;
    }
    case CodeViewMode.Label: {
      return <LabelView content={diffSetting.content} handleClose={diffSetting.handleClose} title={diffSetting.title} />;
    }
    case CodeViewMode.Unknown: {
      return diffSetting.component;
    }
  }
  return null;
};
