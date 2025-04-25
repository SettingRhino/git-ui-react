import {
    BranchCommits,
    GitGraph,
    GitGraphState,
    Commit,
    Tag,
    GiteaBranchCommits,
    GiteaTagResponse,
    transformGitHubBranchCommitsAndTags,
    GitHubBranchCommits,
    GitHubTagResponse,
    transformGitHubBranchCommits
} from "../../index.ts";
import {useEffect, useMemo, useState} from "react";
import {getBranchesCommitWithTags} from "../gitlab-api.tsx";
import { RepoInformation} from "./FullView.tsx";
import {getBranchesCommitWithTagsByGitHub} from "../github-api.tsx";
import {getBranchesCommitWithTagsByGitea} from "../gitea-api.tsx";


const initGraphData = { gitData: { tags: [], branchCommits: [] }, isLoading: true };


const useGitLabHooks = (repoInformation: RepoInformation)=>{
    const [graphState, setGraphState] = useState<GitGraphState>({isLoading: true, gitData: undefined, });
    useEffect(() => {
        getBranchesCommitWithTags(repoInformation.url,repoInformation.token,repoInformation.repo,repoInformation.branches).then((res:{
            tags: Tag[];
            branchCommits: BranchCommits[];
        })=>{
            if (res) {
                setGraphState({ gitData: res, isLoading: false });
            } else {
                setGraphState({isLoading: false, gitData: undefined});
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
    return {commitAction, selectedCommitId, graphState}
}


const useGitHubHooks = (repoInformation: RepoInformation)=>{
    const [graphState, setGraphState] = useState<GitGraphState>({isLoading: true, gitData: undefined, });
    useEffect(() => {
        getBranchesCommitWithTagsByGitHub(repoInformation.url,repoInformation.token,repoInformation.repo,repoInformation.branches).then((res:{
            tags: GitHubTagResponse[];
            branchCommits: GitHubBranchCommits[];
        })=>{
            if (res) {
                const transformGitHub = transformGitHubBranchCommits(res?.branchCommits, res?.tags)
                setGraphState({ gitData: transformGitHub, isLoading: false })
            } else {
                setGraphState({isLoading: false, gitData: undefined, });
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
    return {commitAction, selectedCommitId, graphState}
}


const useGiteaHooks = (repoInformation: RepoInformation)=>{
    const [graphState, setGraphState] = useState<GitGraphState>({isLoading: true, gitData: undefined, });
    useEffect(() => {
        getBranchesCommitWithTagsByGitea(repoInformation.url,repoInformation.token,repoInformation.repo,repoInformation.branches).then((res: {    tags: GiteaTagResponse[];
            branchCommits: GiteaBranchCommits[];}) => {
            if (res){
                const transformGitHub = transformGitHubBranchCommitsAndTags(res?.branchCommits, res?.tags)
                setGraphState({ gitData: transformGitHub, isLoading: false })
            }else {
                setGraphState({isLoading: false, gitData: undefined, });
            }
        })
        return () => {
            setGraphState({...initGraphData, isLoading: true});
        }
    },[])
    const [selectedCommitId, setSelectedCommitId] = useState<string>();
    const commitAction = useMemo(() => {
        return {
            onMessageClick: (commit: Commit)=> setSelectedCommitId(commit.id),
            onDotClick: (commit: Commit)=> setSelectedCommitId(commit.id),
        }
    },[])
    return {commitAction, selectedCommitId, graphState}
}

const GitLabOnlyGraphView = ({ repoInformation }: { repoInformation: RepoInformation })=>{
    const {commitAction, selectedCommitId, graphState} = useGitLabHooks(repoInformation)
    return (
        <div className="git-ui">
            <div className={`left-panel full-view active`}>
                <GitGraph {...graphState} commitAction={commitAction} graphUtil={{focusCommitID: selectedCommitId}}/>
            </div>
        </div>
    )
}

const GitHubOnlyGraphView = ({ repoInformation }: { repoInformation: RepoInformation })=>{
    const {commitAction, selectedCommitId, graphState} = useGitHubHooks(repoInformation)
    return (
        <div className="git-ui">
            <div className={`left-panel full-view active`}>
                <GitGraph {...graphState} commitAction={commitAction} graphUtil={{focusCommitID: selectedCommitId}}/>
            </div>
        </div>
    )
}

const GiteaOnlyGraphView = ({ repoInformation }: { repoInformation: RepoInformation })=>{
    const {commitAction, selectedCommitId, graphState} = useGiteaHooks(repoInformation)
    return (
        <div className="git-ui">
            <div className={`left-panel full-view active`}>
                <GitGraph {...graphState} commitAction={commitAction} graphUtil={{focusCommitID: selectedCommitId}}/>
            </div>
        </div>
    )
}

export const OnlyGraphView = ({ repoInformation }: { repoInformation: RepoInformation }) => {
    if (repoInformation.scm === 'GITLAB'){
        return (<GitLabOnlyGraphView  repoInformation={repoInformation}/>)
    }
    if (repoInformation.scm === 'GITHUB'){
        return (<GitHubOnlyGraphView  repoInformation={repoInformation}/>)
    }
    if (repoInformation.scm === 'GITEA'){
        return (<GiteaOnlyGraphView  repoInformation={repoInformation}/>)
    }
    return null
}