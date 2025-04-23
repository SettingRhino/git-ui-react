import {BranchCommits, Commit, GitGraph, GitGraphState, Tag} from "../../Graph";
import {useEffect, useMemo, useState} from "react";
import {getBranchesCommitWithTags} from "../gitlab-api.tsx";

export const OnlyGraphView = () => {
    const [graphState, setGraphState] = useState<GitGraphState>({isLoading: true, gitData: undefined, });
    useEffect(() => {
        getBranchesCommitWithTags(901,['dev','main','stage']).then((res:{
            tags: Tag[];
            branchCommits: BranchCommits[];
        })=>{
            if (res) {
                setGraphState({ gitData: res, isLoading: false });
            } else {
                setGraphState({isLoading: true, gitData: undefined, });
            }
        }).catch((e)=> {
            console.error(e);
        })
        return () => {
            setGraphState({gitData: undefined, isLoading: true});
        }
    },[])
    const [selectedCommitId, setSelectedCommitId] = useState<string>();
    const commitAction = useMemo(() => {
        return {
            onMessageClick: (commit: Commit)=> setSelectedCommitId(commit.id),
            onDotClick: (commit: Commit)=> setSelectedCommitId(commit.id),
        }
    },[])
    return (
        <div className="git-ui">
            <div className={`left-panel full-view active`}>
                <GitGraph {...graphState} commitAction={commitAction} graphUtil={{focusCommitID: selectedCommitId}}/>
            </div>
        </div>
    )
}