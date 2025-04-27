import {GitLabFullView} from "./GitLabFullView.tsx";
import {GitHubFullView} from "./GitHubFullView.tsx";
import {GiteaFullView} from "./GiteaFullView.tsx";

export type RepoInformation = {
    scm: string;
    url: string;
    token: string;
    repo: string;
    branches: string[];
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