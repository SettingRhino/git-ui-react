import type { GitGraphType } from './type.ts';
import { useEffect, useMemo } from 'react';
import { Gitgraph } from '@gitgraph/react';
import { IconLoading } from '../common/svgs';
import {getGitTemplate, githubColors, githubSubColors, gitTagColors} from './constant.ts';
import { findTextElementByCommitID, focusCircle, gitGraphRender, gitRawRefactor, unFocusCircle } from './graphutils.ts';
import './gitgraph.css';

export const GitGraph = ({ isLoading = false, gitData, commitAction, className, graphUtil, colors }: GitGraphType) => {
  const convertData = useMemo(() => {
    if (gitData) {
      return { ...gitRawRefactor(gitData.tags, gitData.branchCommits), selectedBranchName: gitData.selectedBranchName };
    }
    return null;
  }
  , [gitData]);
  useEffect(() => {
    let circleElement: Element | undefined = undefined;
    if (graphUtil?.focusCommitID) {
      circleElement = findTextElementByCommitID(graphUtil?.focusCommitID);
      focusCircle(circleElement, colors?.focusColor);
    }
    return () => {
      if (circleElement) {
        unFocusCircle(circleElement);
      }
    };
  }, [graphUtil?.focusCommitID]);
  if (isLoading) {
    return (
      <div
        className={`gitGraph ${className || ''}`}
        // style={style}
      >
        <div className="loading-wrap">
          <IconLoading className="loading" />
        </div>
      </div>
    );
  }
  return (
    <div
      className={`gitGraph ${className || ''}`}
      // style={style}
    >
      {convertData && (
        <Gitgraph
          options={{
            template: getGitTemplate({colors: colors?.branchColors || githubColors}),
          }}
        >
          {(gitgraph) => {
            gitgraph.clear()
            gitGraphRender(
                gitgraph,
                convertData.gitRenderCommits,
                convertData.allBranches,
                convertData.tags,
                convertData.selectedBranchName,
                commitAction,
                {
                  colors:
                      {
                        subColors: colors?.subBranchColors || githubSubColors,
                        tagColors: colors?.tagColors || gitTagColors
                      }
                }
            );
          }}
        </Gitgraph>
      )}
    </div>
  );
};
