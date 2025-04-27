import {
    GitDiff,
    GitGraphState, GitHubBranchCommits, GitHubTagResponse,
    GitUI,
    transformGitHubBranchCommits,
    transformGitHubV3PatchMultiFileDiff,
    useGetGitGraph,
} from "../../index.ts";
import {useEffect, useState} from "react";
import { getBranchesCommitWithTagsByGitHub, getCommitDiffByGitHub, getCommitOriginFileByGitHub } from "../github-api.tsx";
import {RepoInformation} from "./FullView.tsx";

const initGraphData = { gitData: { tags: [], branchCommits: [] }, isLoading: true };

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