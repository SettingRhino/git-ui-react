import {
    GitDiff,
    GitGraphState,
    GitUI,
    useGetGitGraph, Tag, BranchCommits
} from "../../index.ts";
import {useEffect, useState} from "react";
import {getBranchesCommitWithTags, getCommitDiff, getCommitOriginFile} from "../gitlab-api.tsx";
import {RepoInformation} from "./FullView.tsx";

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

const colors = ['#F4ACB7','#A2D2FF','#90EE90','#FFEEAA','#E6E6FA']
const colors2 =['#FFCBA4','#FFA07A','#AECFA6','#C8A2C8','#F5F5DC']

export const GitLabFullView = ({ repoInformation }: { repoInformation: RepoInformation }) => {
    const { graphState, getDiffs, getOriginFile } = useGitLabHooks(repoInformation)
    const graphUIState = useGetGitGraph({ gitGraph: { graphState: graphState, colors:{
                branchColors:colors,
                subBranchColors:colors2,
                tagColors: colors,
                focusColor: '#00ff00',
            } }, commitFileView: { getDiffs: getDiffs },codeDiffView:{getOriginFile} });

    return  <GitUI {...graphUIState.ui}/>
}

