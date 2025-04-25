import type { ReactElement } from 'react';
import type { BranchCommits, ChildCommit, CommitAction } from './type.ts';
import {
  githubColors,
  githubSubColors,
  gitTagColors,
  tagLikeBranchStyle,
  tagStyle,
} from './constant.ts';
import { Branch, Tag, Commit } from "../common/type.ts";

type ReactSvgElement = ReactElement<SVGElement>;

type BranchUserApi<T> = {
  t: T;
} & any;

type GitgraphUserApi<T> = {
  t: T;
} & any;

type BranchName = string;

type BranchGraphMap = Map<BranchName, BranchUserApi<ReactSvgElement>>;

const getOrCreateGraph = (globalGitGraph: GitgraphUserApi<ReactSvgElement>, map: BranchGraphMap, branchName: string, from?: BranchUserApi<ReactSvgElement> | string) => {
  let graph: BranchUserApi<ReactSvgElement> | undefined = map.get(branchName);
  if (!graph) {
    // 생성
    if (from) {
      if (typeof from === 'string') {
        graph = globalGitGraph.branch({ from, name: branchName });
      } else {
        graph = from.branch(branchName);
      }
    } else {
      graph = (globalGitGraph.branch({ name: branchName }) as unknown) as BranchUserApi<ReactSvgElement>;
    }
    map.set(branchName, graph);
  }
  return graph;
};

type RenderHistory = { renderCommit: GitRenderCommit; branch: BranchUserApi<ReactSvgElement>; branchName: string; index: number };

class GitRenderCommit {
  private commit: Commit;
  private branches: Branch[];
  private childCommits: ChildCommit[] = [];

  constructor(commit: Commit, branches: Branch[], childCommits: ChildCommit[]) {
    this.commit = commit;
    this.branches = branches;
    this.childCommits = childCommits;
  }

  spread(): { commit: Commit; branches: Branch[]; childCommits: ChildCommit[] } {
    return { commit: this.commit, branches: this.branches, childCommits: this.childCommits };
  }

  isBranchPoint(): boolean {
    return this.childCommits.length > 1;
  }

  isMergeCommit(): boolean {
    return this.commit.parent_ids.length > 1;
  }

  // Getters
  getCommit(): Commit {
    return this.commit;
  }
}

const convertCommitMapToArraySortedByCommittedDate = (
  commitMap: Map<string, GitRenderCommit>,
): GitRenderCommit[] => {
  const renderCommits: GitRenderCommit[] = Array.from(commitMap.values());

  renderCommits.sort((a, b) => {
    const dateA = new Date(a.getCommit().committed_date).getTime();
    const dateB = new Date(b.getCommit().committed_date).getTime();
    return dateA - dateB; // 오래된 순으로 정렬
  });

  return renderCommits;
};

const removeDuplicateCommitsById = (commits: Commit[]): Commit[] => {
  const uniqueCommits: Commit[] = [];
  const seenIds: Set<string> = new Set();

  for (const commit of commits) {
    if (!seenIds.has(commit.id)) {
      seenIds.add(commit.id);
      uniqueCommits.push(commit);
    }
  }

  return uniqueCommits;
};
const removeDuplicateBranchByName = (branches: Branch[]): Branch[] => {
  const uniqueBranches: Branch[] = [];
  const seenIds: Set<string> = new Set();

  for (const b of branches) {
    if (!seenIds.has(b.name)) {
      seenIds.add(b.name);
      uniqueBranches.push(b);
    }
  }

  return uniqueBranches;
};

export const gitRawRefactor = (tags: Tag[], branchCommits: BranchCommits[]): { gitRenderCommits: GitRenderCommit[]; allBranches: Branch[]; tags: Tag[] } => {
  // 1. 모두 시간 정렬할것.
  // branch는 default가 1번, Head Commit이 최신 순
  // commit은 오래된 순
  let allCommits: Commit[] = [];
  const commitBranchMap: Map<string, Branch[]> = new Map();
  const CommitMap: Map<string, GitRenderCommit> = new Map();
  let allBranches: Branch[] = [];

  branchCommits.forEach((branchCommits) => {
    const commitByBranchCommits = branchCommits.commits || [];
    const branchByBranchCommits = branchCommits.branch;
    allBranches = [...allBranches, branchByBranchCommits];
    commitByBranchCommits.forEach((commit) => {
      const oldData = commitBranchMap.get(commit.id);
      if (oldData) {
        commitBranchMap.set(commit.id, sortBranches(removeDuplicateBranchByName([...oldData, branchByBranchCommits])));
      } else {
        commitBranchMap.set(commit.id, [branchByBranchCommits]);
      }
    });
    allCommits = removeDuplicateCommitsById([...allCommits, ...commitByBranchCommits]);
  });

  allBranches = removeDuplicateBranchByName(allBranches);

  allCommits
    .sort((a, b) => new Date(a.committed_date).getTime() - new Date(b.committed_date).getTime())
    .forEach((commit) => {
      const commitBranches = commitBranchMap.get(commit.id) || [];
      const childCommits = allCommits.filter(c => c.parent_ids.includes(commit.id)).map((cc) => {
        if (cc.parent_ids.length > 1) {
          const firstParent = cc.parent_ids[0];
          if (firstParent === commit.id) {
            return {
              isMergeDirect: true,
              commit: cc,
            };
          } else {
            return {
              isMergeDirect: false,
              commit: cc,
            };
          }
        }
        return {
          isMergeDirect: null,
          commit: cc,
        };
      }) || [];
      CommitMap.set(commit.id, new GitRenderCommit(commit, commitBranches, childCommits));
    });
  return { gitRenderCommits: convertCommitMapToArraySortedByCommittedDate(CommitMap), allBranches, tags };
  // branchCommits.sort((a, b) => new Date(b.branch.commit.committed_date).getTime() - new Date(a.branch.commit.committed_date).getTime());
};

const sortBranches = (branches: Branch[]) => {
  let sortedBranches: Branch[] = [];
  let defaultBranch: Branch | null = null;
  branches.sort((a, b) => new Date(b.commit.committed_date).getTime() - new Date(a.commit.committed_date).getTime()).forEach((b) => {
    if (b.default) {
      defaultBranch = b;
    } else {
      sortedBranches = [...sortedBranches, b];
    }
  });
  if (defaultBranch !== null) {
    sortedBranches = [defaultBranch, ...sortedBranches];
  }
  return sortedBranches;
};

const getSimplePriorityBranchName = (branches: Branch[], lastHistoryBranchName?: string, selectedBranchName?: string): string | undefined => {
  //  우선 순위브랜치 선정
  // 1. 이전 브랜치(lastHistory)가 commit내 존재하는가?
  //   1 - O -> 우선 순위는 lastHistory
  //   1 - X -> 우선 순위는 selectedBranch 탐색
  //             ->  선택된 브랜치(selectedBranch)가 commit내 존재하는가?
  //                  O -> selectedBranch
  //                  X ->  undefined
  // 2. 1번이 undefined, branches 중 가장 최신 커밋인 branch 선정
  if (lastHistoryBranchName && branches.find(b => b.name === lastHistoryBranchName)) {
    const innerBranch = branches.find(b => b.name === lastHistoryBranchName);
    if (innerBranch) {
      return innerBranch.name;
    }
  }
  if (selectedBranchName && branches.find(b => b.name === selectedBranchName)) {
    const innerBranch = branches.find(b => b.name === selectedBranchName);
    if (innerBranch) {
      return innerBranch.name;
    }
  }
  const [first] = sortBranches(branches);
  return first?.name;
};

const getMergeSimplePriorityBranchName = (branches: Branch[], commitRender: GitRenderCommit, lastHistoryBranchName?: string, selectedBranchName?: string): string | undefined => {
  //  우선 순위브랜치 선정
  // 1. 이전 브랜치(lastHistory)가 commit내 존재하는가?
  //   1 - O -> 우선 순위는 lastHistory
  //   1 - X -> 우선 순위는 selectedBranch 탐색
  //             ->  선택된 브랜치(selectedBranch)가 commit내 존재하는가?
  //                  O -> selectedBranch
  //                  X ->  undefined
  // 2. 1번이 undefined, branches 중 가장 최신 커밋인 branch 선정
  const commitID = commitRender.getCommit().id;
  if (lastHistoryBranchName && branches.find(b => b.name === lastHistoryBranchName)) {
    const innerBranch = branches.find(b => b.name === lastHistoryBranchName);
    if (innerBranch) {
      return innerBranch.name;
    }
  }
  if (selectedBranchName && branches.find(b => b.name === selectedBranchName)) {
    const innerBranch = branches.find(b => b.name === selectedBranchName);
    if (innerBranch) {
      return innerBranch.name;
    }
  }
  if (commitID && branches.find(b => b.commit.id === commitID)) {
    const innerBranch = branches.find(b => b.commit.id === commitID);
    if (innerBranch) {
      return innerBranch.name;
    }
  }
  const [first] = sortBranches(branches);
  return first?.name;
};

export const gitGraphRender = (gitGraph: GitgraphUserApi<ReactSvgElement>, renderCommits: GitRenderCommit[], allBranches: Branch[], tags: Tag[], seletedBranchName?: string, commitAction?: CommitAction) => {
  const branchGraphMap: BranchGraphMap = new Map();

  const getOrCreateBranchGraph = (name: string, from?: BranchUserApi<ReactSvgElement> | string) => getOrCreateGraph(gitGraph, branchGraphMap, name, from);
  // const onlyGetBranchGraph = (name: string) => onlyGetGraph(gitGraph, branchGraphMap, name);
  // const deleteBranchGraph = (name: string) => deleteGraph(gitGraph, branchGraphMap, name);
  const generateCommitTempBranch = (commitID?: string) => commitID ? `commit-${commitID}-temp` : undefined;

  const selectedBranch: Branch | undefined = allBranches.find((b) => {
    if (seletedBranchName) {
      return seletedBranchName === b.name;
    } else {
      return b.default;
    }
  });
  // Commit당 쌓는 History
  const historyMap: Map<string, RenderHistory> = new Map();

  const findLastHistoryByBranchName = (name: string) => {
    const reverseHistory = Array.from(historyMap.values()).sort((a, b) => b.index - a.index);
    return reverseHistory.find(h => h.branchName === name);
  };
  const checkEndpointBranchGraph = (endPointCommit: string, branchName: string) => {
    const last = findLastHistoryByBranchName(branchName);
    if (last) {
      return last.renderCommit.getCommit().id === endPointCommit;
    }
    return false;
  };
  const findMap: Map<string, GitRenderCommit> = new Map();
  renderCommits.forEach((renderCommit) => {
    findMap.set(renderCommit.getCommit().id, renderCommit);
  });
  // Branch 기준으로 commit이 직계인지 확인
  const isDirectLine = (branchName: string, commitID: string) => {
    const branchCommit = allBranches.find(b => b.name === branchName)?.commit.id;
    let result = false;
    if (branchCommit) {
      let findCommit = branchCommit;
      while (true) {
        const rc = findMap.get(findCommit);
        if (rc) {
          if (rc.getCommit().id === commitID) {
            result = true;
            break;
          } else {
            const [first] = rc.getCommit().parent_ids;
            if (first) {
              findCommit = first;
              continue;
            }
            break;
          }
        } else {
          break;
        }
      }
    }
    return result;
  };
  // 부모 추적
  const traceParent: Map<string, { isMergeDirect: boolean | null; imYourFather: GitRenderCommit }> = new Map();

  //
  const commitRenderAfter = () => {
    // commit을 모두 찍고 graph 정리 작업
    // 1. 브런치 라벨 찍기
    // 2. Tag 찍기

    // 브런치 라벨 찍기
    let noRenderColorIndex = 0;
    const branchLabelTags = allBranches.map((branch) => {
      let tempIndex = 0;
      let branchInfo: { branch: Branch; color: string } | undefined;
      branchGraphMap.forEach((_bG, key) => {
        const color = githubColors[tempIndex % 10];
        tempIndex = tempIndex + 1;
        if (branch.name === key) {
          branchInfo = { branch, color };
        }
      });
      if (!branchInfo) {
        branchInfo = { branch: branch, color: githubSubColors[noRenderColorIndex % 10] };
        noRenderColorIndex++;
      }
      return branchInfo;
    });

    branchLabelTags.forEach((branchInfo) => {
      gitGraph.tag({
        name: branchInfo.branch.name,
        ref: branchInfo.branch.commit.id,
        style: { ...tagLikeBranchStyle, strokeColor: branchInfo.color },
      });
    });

    // 4. Tag 찍기
    tags.forEach((tag, index) => {
      try {
        gitGraph.tag({ name: `Tag : [${tag.name}]`, ref: tag.commit.id, style: { ...tagStyle, color: gitTagColors[index % 20], strokeColor: gitTagColors[index % 20] } });
      } catch (e) {
        console.error(e);
      }
    });
  };

  const mergeRender = (commit: Commit, branchGraph: BranchUserApi<ReactSvgElement>) => {
    const sourceCommit = commit.parent_ids[1];
    const sourceHistory = historyMap.get(sourceCommit);
    const sourceBranchName = sourceHistory?.branchName || generateCommitTempBranch(commit.id);
    const sourceBranchGraph = getOrCreateBranchGraph(sourceBranchName || `error_source_${commit.id}`, sourceHistory?.branch);
    try {
      branchGraph.merge({
        branch: sourceBranchGraph,
        commitOptions: {
          hash: commit.id,
          subject: commit.title,
          author: `<span class="math-inline">${commit.author_name}</span>${commit.author_email}>`,
          parents: commit.parent_ids,
          onClick: () => {
            if (commitAction?.onDotClick) {
              commitAction.onDotClick(commit);
            }
          },
          onMessageClick: () => {
            if (commitAction?.onMessageClick) {
              commitAction.onMessageClick(commit);
            }
          },
        },
      });
    } catch (e) {
      console.warn('Failed to merge', e);
      branchGraph.commit({
        hash: commit.id,
        subject: commit.title,
        author: `<span class="math-inline">${commit.author_name}</span>${commit.author_email}>`,
        parents: commit.parent_ids,
        onClick: () => {
          if (commitAction?.onDotClick) {
            commitAction.onDotClick(commit);
          }
        },
        onMessageClick: () => {
          if (commitAction?.onMessageClick) {
            commitAction.onMessageClick(commit);
          }
        },
      });
    }
  }
  const commitRender = (commit: Commit, branchGraph: BranchUserApi<ReactSvgElement>) => {
    branchGraph.commit({
      hash: commit.id,
      subject: commit.title,
      author: `<span class="math-inline">${commit.author_name}</span>${commit.author_email}>`,
      parents: commit.parent_ids,
      onClick: () => {
        if (commitAction?.onDotClick) {
          commitAction.onDotClick(commit);
        }
      },
      onMessageClick: () => {
        if (commitAction?.onMessageClick) {
          commitAction.onMessageClick(commit);
        }
      },
    });
  }
  renderCommits.forEach((renderCommit, index) => {
    try {
      const { commit, branches, childCommits } = renderCommit.spread();
      let renderGraph: any;
      let renderBranchName: string = '';
      // 분기
      if (renderCommit.isBranchPoint()) {
        // -> 자식에게 흔적 남기기
        childCommits.forEach((childCommit) => {
          traceParent.set(childCommit.commit.id, { isMergeDirect: childCommit.isMergeDirect, imYourFather: renderCommit });
        });
      }
      //
      const findTraceParent = traceParent.get(commit.id);
        if (findTraceParent) {
        // 분기되어 나온 자식
        // History 뒤져서 -> 부모가 쓴 브렌치 이름을 찾는다.
        let isMergeDirect = findTraceParent.isMergeDirect;
        // 직계인지, 방계인지?
        if (isMergeDirect === null) {
          // 부모의 브런치 이름을 넘겨서 그 부모의 직계인지 본다.
          const parent = historyMap.get(findTraceParent.imYourFather.getCommit().id)?.branchName;
          const prior = getSimplePriorityBranchName(branches, parent, selectedBranch?.name);

          if (prior) {
            isMergeDirect = isDirectLine(prior, commit.id);
          } else {
            isMergeDirect = false;
          }
        }
        if (isMergeDirect) {
          // 직계의 경우 부모의 브런치를 그대로 쓴다.
          // 부모의 브랜치 이름이 내 브랜치 중에 없는 경우?
          // (브런치 이름 중, 셀렉트된 브런치 - 가장 마지막 커밋)
          const [parentCommit] = commit.parent_ids; // 부모 1개
          const priorityBranchName = getSimplePriorityBranchName(branches, historyMap.get(parentCommit)?.branchName, selectedBranch?.name) || generateCommitTempBranch(commit.id);
          let branchGraph;
          if (!checkEndpointBranchGraph(historyMap.get(parentCommit)?.branchName || '', historyMap.get(parentCommit)?.renderCommit.getCommit().id || '')) {
            branchGraph = getOrCreateBranchGraph(priorityBranchName || '', parentCommit);
          } else {
            branchGraph = getOrCreateBranchGraph(priorityBranchName || '', historyMap.get(parentCommit)?.branch);
          }
          if(renderCommit.isMergeCommit()){
            mergeRender(commit, branchGraph)
            renderBranchName = priorityBranchName || '';
            renderGraph = branchGraph;
          }else{
            commitRender(commit, branchGraph)
            renderBranchName = priorityBranchName || '';
            renderGraph = branchGraph;
          }

        } else {
          // 방계는 새로 만든다.
          // 나의 브런치 중에, 부모 브런치 제외, 하고 남은 브랜치가 있으면 그중에 추천 브런치를 쓰고 아니면 임시 브런치를 만드는데 render = false
          // 나의 브런치 중에, 부모 브런치 제외, 하고 남은 브랜치가 있으면, 그중에 자신이 직계인 브런치의 브런치를 쓴다.
          const [parentCommit] = commit.parent_ids; // 부모 1개
          const parentHistory = historyMap.get(parentCommit);
          const omitbranches = branches.filter(b => b.name !== parentHistory?.branchName).filter(b => isDirectLine(b.name, commit.id));

          const priorityBranchName = getSimplePriorityBranchName(omitbranches, undefined, selectedBranch?.name) || generateCommitTempBranch(commit.id) || '';
          const branchGraph = getOrCreateBranchGraph(priorityBranchName, parentHistory?.renderCommit?.getCommit().id);
          if(renderCommit.isMergeCommit()){
            mergeRender(commit, branchGraph)
            renderBranchName = priorityBranchName || '';
            renderGraph = branchGraph;
          }else{
            commitRender(commit, branchGraph)
            renderBranchName = priorityBranchName;
            renderGraph = branchGraph;
          }

        }
      } else {
        // simple Commit
        // 부모 브랜치가 나의 브랜치에 존재한다. 그거
        // (브런치 이름 중, 셀렉트된 브런치 - 가장 마지막 커밋)
        const [parentCommit] = commit.parent_ids; // 부모 1개
        //
        const omitbranches = branches.filter(b => isDirectLine(b.name, commit.id));
        let branchGraph;
        let commitBrachName = '';
        if (omitbranches.length === 0) {
          branchGraph = getOrCreateBranchGraph(historyMap.get(parentCommit)?.branchName || generateCommitTempBranch(parentCommit) || '', historyMap.get(parentCommit)?.branch);
          commitBrachName = historyMap.get(parentCommit)?.branchName || '';
        } else {
          const priorityBranchName = getSimplePriorityBranchName(omitbranches, historyMap.get(parentCommit)?.branchName, selectedBranch?.name) || generateCommitTempBranch(commit.id) || '';
          branchGraph = getOrCreateBranchGraph(priorityBranchName, historyMap.get(parentCommit)?.branch);
          commitBrachName = priorityBranchName;
        }
        // const priorityBranchName = getSimplePriorityBranchName(omitbranches, historyMap.get(parentCommit)?.branchName, selectedBranch?.name) || commit.id;
        // const branchGraph = getOrCreateBranchGraph(priorityBranchName, historyMap.get(parentCommit)?.branch);
          if(renderCommit.isMergeCommit()){
            mergeRender(commit, branchGraph)
            renderBranchName = commitBrachName || '';
            renderGraph = branchGraph;
          }else{
            commitRender(commit, branchGraph)
            renderBranchName = commitBrachName;
            renderGraph = branchGraph;
          }

      }
      historyMap.set(commit.id, { renderCommit, branch: renderGraph, branchName: renderBranchName, index });
    } catch (e) {
      console.error(e);
    }
  });
  commitRenderAfter();
};

export const findTextElementByCommitID = (commitID: string) => {
  if (commitID === '') {
    return undefined;
  }
  // SVG 내의 모든 <text> 요소를 찾습니다. (필요시 범위를 더 좁힐 수 있습니다)
  const circleElements = document.querySelectorAll('.gitGraph svg circle'); // 'svg' 부분을 더 구체적인 부모 요소로 변경 가능
  // 1. NodeList를 실제 배열로 변환합니다.
  const elementsArray = Array.from(circleElements);

  // 2. 배열의 find() 메서드를 사용하여 ID가 일치하는 첫 번째 요소를 찾습니다.
  return elementsArray.find((element) => {
    return element.id === commitID;
  });
};

export const focusCircle = (el?: Element) => {
  if (el) {
    // 3. setAttribute를 사용하여 stroke와 stroke-width 속성을 설정합니다.
    const newStrokeColor = '#555555'; // 원하는 선 색상
    const newStrokeWidth = '5'; // 원하는 선 두께 (단위 없이 숫자만 입력 가능)

    el.setAttribute('stroke', newStrokeColor);
    el.setAttribute('stroke-width', newStrokeWidth);
    el.setAttribute('stroke-dasharray', '8 2');
  }
};

export const unFocusCircle = (el?: Element) => {
  if (el) {
    el.removeAttribute('stroke');
    el.removeAttribute('stroke-width');
    el.removeAttribute('stroke-dasharray');
  }
};
