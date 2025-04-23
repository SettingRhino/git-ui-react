import {BranchCommits, GitDiff, GitGraphState, GitUI, Tag, useGetGitGraph} from "../../index.ts";
import {useEffect, useState} from "react";
import {getBranchesCommitWithTags, getCommitDiff, getCommitOriginFile} from "../gitlab-api.tsx";

const initGraphData = { gitData: { tags: [], branchCommits: [] }, isLoading: true };

export const FullView = () => {
    const [graphState, setGraphState] = useState<GitGraphState>(initGraphData)
    useEffect(() => {
        // Promise<{ tags: Tag[]; branchCommits: BranchCommits[]; }>
        getBranchesCommitWithTags(901,['dev','main','stage']).then((res:{
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
        return getCommitDiff(901,commitId)
    }
    const getOriginFile = async (commitId: string, path:string): Promise<string|null|undefined> => {
        return getCommitOriginFile(901,commitId, path)
    }
    const graphUIState = useGetGitGraph({ gitGraph: { graphState: graphState }, commitFileView: { getDiffs: getDiffs },codeDiffView:{getOriginFile} });

    return  <GitUI {...graphUIState.ui}/>
}