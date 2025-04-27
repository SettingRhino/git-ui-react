## @settingrhino/git-ui-react

@settingrhino/git-ui-react provides a GUI to check Git's branch graph and file changes.

### Installation
```
npm install @settingrhino/git-ui-react
pnpm install @settingrhino/git-ui-react
yarn add @settingrhino/git-ui-react
```

### Info
This graph library was initially developed based on self-hosted GitLab.

Currently, it offers utilities to convert data from GitHub and Gitea formats, making them suitable for graphing.
These conversion functions are provided via `transform`.
Please refer to the `demo` directory for usage examples.
Furthermore, it allows you to import and use CSS files for styling.

### Example
You can check the examples by coming to the Git repository.(src/demo)
```
import {
    GitDiff,
    GitGraphState, GitHubBranchCommits, GitHubTagResponse,
    GitUI,
    transformGitHubBranchCommits,
    transformGitHubV3PatchMultiFileDiff,
    useGetGitGraph,
} from "@settingrhino/git-ui-react";
import {useEffect, useState} from "react";
import { getBranchesCommitWithTagsByGitHub, getCommitDiffByGitHub, getCommitOriginFileByGitHub } from "../github-api.tsx";
import "@settingrhino/git-ui-react/style.css"
// Sample
const useGitHubHooks = (repoInformation: RepoInformation) => {
    const [graphState, setGraphState] = useState<GitGraphState>(initGraphData)
    useEffect(() => {
        getBranchesCommitWithTagsByGitHub(repoInformation.url, repoInformation.token, repoInformation.repo, repoInformation.branches).then((res: {    tags: GitHubTagResponse[];
            branchCommits: GitHubBranchCommits[];}) => {
            if (res){
                const transformGitHub = transformGitHubBranchCommits(res?.branchCommits, res?.tags)
                setGraphState({ gitData: transformGitHub, isLoading: false })
            }else {
                setGraphState(initGraphData);
            }
        })
        return () => {
            setGraphState({...initGraphData, isLoading: true});
        }
    },[])
    const getDiffs: (commitId: string) => Promise<GitDiff[] | null | undefined> = async (commitId: string) => {
        const gitDiff = await getCommitDiffByGitHub(repoInformation.url,repoInformation.token,repoInformation.repo, commitId)
        return transformGitHubV3PatchMultiFileDiff(gitDiff)
    }
    const getOriginFile = async (commitId: string, path:string): Promise<string|null|undefined> => {
        return getCommitOriginFileByGitHub(repoInformation.url,repoInformation.token,repoInformation.repo,commitId, path)
    }
    return {
        graphState, getDiffs,getOriginFile
    }
}


export const GitHubFullView = ({ repoInformation }: { repoInformation: RepoInformation }) => {
    const { graphState, getDiffs, getOriginFile } = useGitHubHooks(repoInformation)
    const graphUIState = useGetGitGraph({ gitGraph: { graphState: graphState }, commitFileView: { getDiffs: getDiffs },codeDiffView:{getOriginFile} });
    return  <GitUI {...graphUIState.ui}/>
}
```

### Sample Image 
![sample](https://github.com/SettingRhino/git-ui-react/raw/main/images/sample-images-01.png)

### npm
https://www.npmjs.com/package/@settingrhino/git-ui-react

#### Warning

**Incompatible with StrictMode:** May cause errors in StrictMode environments.