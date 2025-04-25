import {
    GitDiff,
    GitGraphState, GitHubBranchCommits, GitHubTagResponse,
    GiteaBranchCommits, GiteaTagResponse,
    GitUI,
    transformGitHubBranchCommits,
    transformGitHubV3PatchMultiFileDiff,
    useGetGitGraph, transformGitHubBranchCommitsAndTags, transformGiteaV3PatchMultiFileDiff, Tag, BranchCommits
} from "../../index.ts";
import {useEffect, useState} from "react";
import { getBranchesCommitWithTagsByGitHub, getCommitDiffByGitHub, getCommitOriginFileByGitHub } from "../github-api.tsx";
import {getBranchesCommitWithTagsByGitea, getCommitDiffByGitea, getCommitOriginFileByGitea} from "../gitea-api.tsx";
import {getBranchesCommitWithTags, getCommitDiff, getCommitOriginFile} from "../gitlab-api.tsx";

export type RepoInformation = {
    scm: string;
    url: string;
    token: string;
    repo: string;
    branches: string[];
}
const initGraphData = { gitData: { tags: [], branchCommits: [] }, isLoading: true };

// GitLab Test
const useGitLabHooks = (repoInformation: RepoInformation) => {
    const [graphState, setGraphState] = useState<GitGraphState>(initGraphData)
    useEffect(() => {
        // Promise<{ tags: Tag[]; branchCommits: BranchCommits[]; }>
        getBranchesCommitWithTags(repoInformation.url, repoInformation.token, repoInformation.repo, repoInformation.branches).then((res:{
            tags: Tag[];
            branchCommits: BranchCommits[];
        })=>{
            if (res) {
                setGraphState({ gitData: res, isLoading: false });
            } else {
                setGraphState(initGraphData);
            }
        }).catch((e)=> {
            console.error(e);
        })
        return () => {
            setGraphState({...initGraphData, isLoading: true});
        }
    },[])
    const getDiffs: (commitId: string) => Promise<GitDiff[] | null | undefined> = (commitId: string)=>{
        return getCommitDiff(repoInformation.url,repoInformation.token,repoInformation.repo,commitId)
    }
    const getOriginFile = async (commitId: string, path:string): Promise<string|null|undefined> => {
        return getCommitOriginFile(repoInformation.url,repoInformation.token,repoInformation.repo,commitId, path)
    }
    return {
        graphState, getDiffs,getOriginFile
    }
}

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

const useGiteaHooks = (repoInformation: RepoInformation) => {
    const [graphState, setGraphState] = useState<GitGraphState>(initGraphData)
    useEffect(() => {
        getBranchesCommitWithTagsByGitea(repoInformation.url,repoInformation.token,repoInformation.repo,repoInformation.branches).then((res: {    tags: GiteaTagResponse[];
            branchCommits: GiteaBranchCommits[];}) => {
            if (res){
                const transformGitHub = transformGitHubBranchCommitsAndTags(res?.branchCommits, res?.tags)
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
        const gitDiff = await getCommitDiffByGitea(repoInformation.url,repoInformation.token,repoInformation.repo, commitId)
        return transformGiteaV3PatchMultiFileDiff(gitDiff)
    }
    const getOriginFile = async (commitId: string, path:string): Promise<string|null|undefined> => {
        return getCommitOriginFileByGitea(repoInformation.url,repoInformation.token,repoInformation.repo,commitId, path)

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
export const GiteaFullView = ({ repoInformation }: { repoInformation: RepoInformation }) => {
    const { graphState, getDiffs, getOriginFile } = useGiteaHooks(repoInformation)
    const graphUIState = useGetGitGraph({ gitGraph: { graphState: graphState }, commitFileView: { getDiffs: getDiffs },codeDiffView:{getOriginFile} });

    return  <GitUI {...graphUIState.ui}/>
}
export const GitLabFullView = ({ repoInformation }: { repoInformation: RepoInformation }) => {
    const { graphState, getDiffs, getOriginFile } = useGitLabHooks(repoInformation)
    const graphUIState = useGetGitGraph({ gitGraph: { graphState: graphState }, commitFileView: { getDiffs: getDiffs },codeDiffView:{getOriginFile} });

    return  <GitUI {...graphUIState.ui}/>
}


export const FullView = ({ repoInformation }: { repoInformation: RepoInformation }) => {
    if (repoInformation.scm === 'GITLAB'){
        return (<GitLabFullView  repoInformation={repoInformation}/>)
    }
    if (repoInformation.scm === 'GITHUB'){
        return (<GitHubFullView  repoInformation={repoInformation}/>)
    }
    if (repoInformation.scm === 'GITEA'){
        return (<GiteaFullView  repoInformation={repoInformation}/>)
    }
    return null
}