import {BranchCommits, GitDiff, GitGraphState, GitUI, Tag, useGetGitGraph} from "./index.ts";
import {useEffect, useState} from "react";
import {getBranchesCommitWithTags, getCommitDiff, getCommitOriginFile} from "./demo-api/gitlab-api.tsx";

const initGraphData = { gitData: { tags: [], branchCommits: [] }, isLoading: true };

function App() {
    const [graphState, setGraphState] = useState<GitGraphState>(initGraphData)
    useEffect(() => {
        getBranchesCommitWithTags(901,['dev','main','stage']).then((res:{
            tags: Tag[];
            branchCommits: BranchCommits[];
        })=>{
            if (res) {
                setGraphState({ gitData: res, isLoading: false });
            } else {
                setGraphState(initGraphData);
            }
        }).catch((e)=>{
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

    return (
        <div style={{width: '80%', padding: '50px', border: 'solid 1px gray',}}>
        <GitUI {...graphUIState.ui}/>
        </div>
    )
}


export default App
