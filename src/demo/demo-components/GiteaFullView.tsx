import {
    GitDiff,
    GitGraphState,
    GiteaBranchCommits, GiteaTagResponse,
    GitUI,
    useGetGitGraph, transformGitHubBranchCommitsAndTags, transformGiteaV3PatchMultiFileDiff,
} from "../../index.ts";
import {useEffect, useState} from "react";
import {getBranchesCommitWithTagsByGitea, getCommitDiffByGitea, getCommitOriginFileByGitea} from "../gitea-api.tsx";
import {RepoInformation} from "./FullView.tsx";

const initGraphData = { gitData: { tags: [], branchCommits: [] }, isLoading: true };


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

export const GiteaFullView = ({ repoInformation }: { repoInformation: RepoInformation }) => {
    const { graphState, getDiffs, getOriginFile } = useGiteaHooks(repoInformation)
    const graphUIState = useGetGitGraph({ gitGraph: { graphState: graphState }, commitFileView: { getDiffs: getDiffs },codeDiffView:{getOriginFile} });

    return  <GitUI {...graphUIState.ui}/>
}