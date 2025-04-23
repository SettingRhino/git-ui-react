## @settingrhino/git-ui-react

@settingrhino/git-ui-react provides a GUI to check Git's branch graph and file changes.

### Installation
```
npm install @settingrhino/git-ui-react
pnpm install @settingrhino/git-ui-react
yarn add @settingrhino/git-ui-react
```

### Example
You can check the examples by coming to the Git repository.(src/demo)
```
export const FullView = () => {
    const [graphState, setGraphState] = useState<GitGraphState>(initGraphData)
    useEffect(() => {
        // Promise<{ tags: Tag[]; branchCommits: BranchCommits[]; }>
        // User-provided Promise function
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
        // User-provided Promise function
        return getCommitDiff(901,commitId)
    }
    const getOriginFile = async (commitId: string, path:string): Promise<string|null|undefined> => {
        // User-provided Promise function
        return getCommitOriginFile(901,commitId, path)
    }
    const graphUIState = useGetGitGraph({ gitGraph: { graphState: graphState }, commitFileView: { getDiffs: getDiffs },codeDiffView:{getOriginFile} });

    return  <GitUI {...graphUIState.ui}/>
}
```

#### Warning

**Incompatible with StrictMode:** May cause errors in StrictMode environments.
