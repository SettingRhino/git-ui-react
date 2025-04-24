import {
    GitDiff,
    GitGraphState, GitHubBranchCommits, GitHubTagResponse,
    GitUI,
    transformGitHubBranchCommits,
    transformGitHubV3PatchMultiFileDiff,
    useGetGitGraph
} from "../../index.ts";
import {useEffect, useState} from "react";
import { getBranchesCommitWithTagsByGitHub, getCommitDiffByGitHub, getCommitOriginFileByGitHub } from "../github-api.tsx";

const initGraphData = { gitData: { tags: [], branchCommits: [] }, isLoading: true };

// GitLab Test
// const useGitLabHooks = () => {
//     const [graphState, setGraphState] = useState<GitGraphState>(initGraphData)
//     useEffect(() => {
//         // Promise<{ tags: Tag[]; branchCommits: BranchCommits[]; }>
//         getBranchesCommitWithTags(901,['dev','main','stage']).then((res:{
//             tags: Tag[];
//             branchCommits: BranchCommits[];
//         })=>{
//             if (res) {
//                 setGraphState({ gitData: res, isLoading: false });
//             } else {
//                 setGraphState(initGraphData);
//             }
//         }).catch((e)=> {
//             console.error(e);
//         })
//         return () => {
//             setGraphState({...initGraphData, isLoading: true});
//         }
//     },[])
//     const getDiffs: (commitId: string) => Promise<GitDiff[] | null | undefined> = (commitId: string)=>{
//         return getCommitDiff(901,commitId)
//     }
//     const getOriginFile = async (commitId: string, path:string): Promise<string|null|undefined> => {
//         return getCommitOriginFile(901,commitId, path)
//     }
//     return {
//         graphState, getDiffs,getOriginFile
//     }
// }

const useGitHubHooks = () => {
    const [graphState, setGraphState] = useState<GitGraphState>(initGraphData)
    useEffect(() => {
        getBranchesCommitWithTagsByGitHub('SettingRhino/git-ui-react-testing-repo', ['main', 'dev']).then((res: {    tags: GitHubTagResponse[];
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
        const gitDiff = await getCommitDiffByGitHub('SettingRhino/git-ui-react-testing-repo', commitId)
        return transformGitHubV3PatchMultiFileDiff(gitDiff)
    }
    const getOriginFile = async (commitId: string, path:string): Promise<string|null|undefined> => {
        return getCommitOriginFileByGitHub('SettingRhino/git-ui-react-testing-repo',commitId, path)

    }
    return {
        graphState, getDiffs,getOriginFile
    }
}

export const FullView = () => {
    const { graphState, getDiffs, getOriginFile } = useGitHubHooks()
    const graphUIState = useGetGitGraph({ gitGraph: { graphState: graphState }, commitFileView: { getDiffs: getDiffs },codeDiffView:{getOriginFile} });

    return  <GitUI {...graphUIState.ui}/>
}