import {useEffect, useState} from "react";
import { FullView } from "./FullView.tsx";
import {OnlyGraphView} from "./OnlyGraphView.tsx";

const Mode = {
    FULL: "FULL",
    OnlyGraph: "OnlyGraph",
} as const;

const SCMType = {
    GITLAB: "GITLAB",
    GITHUB: "GITHUB",
    GITEA: "GITEA",
} as const;

const StringArrayForm = ({ inputFields, setInputFields }: any)=> {

    // 특정 인덱스의 입력 필드 값이 변경될 때 호출될 함수
    const handleInputChange = (index: number, event: any) => {
        // 상태 배열 복사
        const values = [...inputFields];
        // 해당 인덱스의 값 업데이트
        values[index] = event.target.value;
        // 상태 업데이트
        setInputFields(values);
    };

    // 새 입력 필드를 추가하는 함수
    const handleAddField = () => {
        // 기존 배열에 빈 문자열 추가하여 상태 업데이트
        setInputFields([...inputFields, '']);
    };

    // 특정 인덱스의 입력 필드를 제거하는 함수
    const handleRemoveField = (index: number) => {
        // 필드가 1개만 남았을 때는 제거하지 않도록 선택적으로 처리 가능
        // if (inputFields.length <= 1) return;

        // 해당 인덱스를 제외한 새 배열 생성
        const values = inputFields.filter((_: any, i:number) => {
            return i !== index;
        });
        // 상태 업데이트
        setInputFields(values);
    };

    return (
        <div style={{display: "flex", justifyContent: "space-between"}}>
            {inputFields.map((inputField:string, index: number) => (
                <div key={index} style={{ display: 'flex',  }}>
                    <input
                        type="text"
                        value={inputField}
                        onChange={(event) => handleInputChange(index, event)}
                        style={{ flexGrow: 1, }} // 입력 필드가 남은 공간 차지
                    />
                    {/* 필드가 2개 이상일 때만 제거 버튼 표시 (선택적) */}
                    {inputFields.length > 1 && (
                        <button
                            type="button" // 폼 제출 방지
                            onClick={() => handleRemoveField(index)}
                            style={{ cursor: 'pointer' }}
                        >
                            delete
                        </button>
                    )}
                </div>
            ))}

            <div>
                <button
                    type="button" // 폼 제출 방지
                    onClick={handleAddField}
                    style={{  cursor: 'pointer' }}
                >
                    add
                </button>
            </div>
        </div>
    );
}



const GitHubInformations = ({setRepoCredential}: any)=>{
    const [branches, setBranches] = useState(['main','dev']);
    const [url, setURL] = useState<any>(import.meta.env.VITE_GITHUB_URL || '');
    const [token, setToken] = useState<any>(import.meta.env.VITE_GITHUB_TOKEN ||'');
    const [repo, setRepo] = useState<any>(import.meta.env.VITE_GITHUB_PROJECT || '');
    return (
        <div style={{display: 'flex', gap: '0.5rem', flexDirection: 'column'}}>
            GitHub
           <div style={{display: 'flex', gap: '1rem',}}>
               <div>Credential </div>
               <div>URL: <input value={url} onChange={(e)=>setURL(e.target.value)}/> </div>
               <div>Token: <input value={token} onChange={(e)=>setToken(e.target.value)}/> </div>
           </div>
            <div style={{display: 'flex', gap: '1rem',}}>
                <div>Repository</div>
                <div>repo: <input value={repo} onChange={(e)=>{setRepo(e.target.value)}}/> </div>
                <div style={{display: 'flex', gap: '1rem',}}>Branches: <StringArrayForm inputFields={branches} setInputFields={setBranches}/> </div>
            </div>
            <button style={{
                background: 'aliceblue',
                border: '1px solid black',
                borderRadius: '5px',
                padding: '5px',
                cursor: 'pointer',
            }} onClick={() => setRepoCredential({
                scm: SCMType.GITHUB,
                url: url,
                token: token,
                repo: repo,
                branches: branches,
            })}>Save</button>
        </div>
    )
}

const GitLabInformations = ({setRepoCredential}: any)=>{
    const [branches, setBranches] = useState(['main','dev']);
    const [url, setURL] = useState<any>(import.meta.env.VITE_GITLAB_URL || '');
    const [token, setToken] = useState<any>(import.meta.env.VITE_GITLAB_TOKEN ||'');
    const [repo, setRepo] = useState<any>(import.meta.env.VITE_GITLAB_PROJECT || '');
    return (
        <div style={{display: 'flex', gap: '0.5rem', flexDirection: 'column'}}>
            GitHub
            <div style={{display: 'flex', gap: '1rem',}}>
                <div>Credential </div>
                <div>URL: <input value={url} onChange={(e)=>setURL(e.target.value)}/> </div>
                <div>Token: <input value={token} onChange={(e)=>setToken(e.target.value)}/> </div>
            </div>
            <div style={{display: 'flex', gap: '1rem',}}>
                <div>Repository</div>
                <div>ProjectID: <input value={repo} onChange={(e)=>{setRepo(e.target.value)}}/> </div>
                <div style={{display: 'flex', gap: '1rem',}}>Branches: <StringArrayForm inputFields={branches} setInputFields={setBranches}/> </div>
            </div>
            <button style={{
                background: 'aliceblue',
                border: '1px solid black',
                borderRadius: '5px',
                padding: '5px',
                cursor: 'pointer',
            }} onClick={() => setRepoCredential({
                scm: SCMType.GITLAB,
                url: url,
                token: token,
                repo: repo,
                branches: branches,
            })}>Save</button>
        </div>
    )
}

const GitTeaInformations = ({setRepoCredential}: any)=>{
    const [branches, setBranches] = useState(['main','dev']);
    const [url, setURL] = useState<any>(import.meta.env.VITE_GITEA_URL || '');
    const [token, setToken] = useState<any>(import.meta.env.VITE_GITEA_TOKEN ||'');
    const [repo, setRepo] = useState<any>(import.meta.env.VITE_GITEA_PROJECT || '');
    return (
        <div style={{display: 'flex', gap: '0.5rem', flexDirection: 'column'}}>
            GitHub
            <div style={{display: 'flex', gap: '1rem',}}>
                <div>Credential </div>
                <div>URL: <input value={url} onChange={(e)=>setURL(e.target.value)}/> </div>
                <div>Token: <input value={token} onChange={(e)=>setToken(e.target.value)}/> </div>
            </div>
            <div style={{display: 'flex', gap: '1rem',}}>
                <div>Repository</div>
                <div>repo: <input value={repo} onChange={(e)=>{setRepo(e.target.value)}}/> </div>
                <div style={{display: 'flex', gap: '1rem',}}>Branches: <StringArrayForm inputFields={branches} setInputFields={setBranches}/> </div>
            </div>
            <button style={{
                background: 'aliceblue',
                border: '1px solid black',
                borderRadius: '5px',
                padding: '5px',
                cursor: 'pointer',
            }} onClick={() => setRepoCredential({
                scm: SCMType.GITEA,
                url: url,
                token: token,
                repo: repo,
                branches: branches,
            })}>Save</button>
        </div>
    )
}

const SCMInfo = ({type, setRepoCredential}: any)=>{
    if (type === SCMType.GITHUB) {
        return (<GitHubInformations setRepoCredential={setRepoCredential} key={type}/>)
    }
    if (type === SCMType.GITLAB) {
        return (<GitLabInformations setRepoCredential={setRepoCredential} key={type}/>)
    }
    if (type === SCMType.GITEA) {
        return (<GitTeaInformations setRepoCredential={setRepoCredential} key={type}/>)
    }
    return null
}

export const ModeSwitchView = () => {
    const [SCM, setSCM] = useState<string>(SCMType.GITLAB);
    const [mode, setMode] = useState<string>(Mode.FULL);
    const [repocredential, setRepoCredential] = useState<any>()
    const [status, setStatus] = useState<boolean>(false);
    useEffect(()=>{
        setRepoCredential(undefined)
        setStatus(false)
    },[SCM])

    return (
        <div style={{ display: "flex", flexDirection: "column" , width: '80%', height: '100%'}}>
            <div style={{display: 'flex', gap: '1rem', }}>
                <button style={{
                    background: SCM === SCMType.GITHUB ? 'skyblue':'aliceblue',
                    border: '1px solid black',
                    borderRadius: '5px',
                    padding: '5px',
                    cursor: 'pointer',
                }} onClick={() => setSCM(SCMType.GITHUB)}>{SCMType.GITHUB}</button>
                <button style={{
                    background: SCM === SCMType.GITLAB ? 'skyblue':'aliceblue',
                    border: '1px solid black',
                    borderRadius: '5px',
                    padding: '5px',
                    cursor: 'pointer',
                }} onClick={() => setSCM(SCMType.GITLAB)}>{SCMType.GITLAB}</button>
                <button style={{
                    background: SCM === SCMType.GITEA ? 'skyblue':'aliceblue',
                    border: '1px solid black',
                    borderRadius: '5px',
                    padding: '5px',
                    cursor: 'pointer',
                }} onClick={() => setSCM(SCMType.GITEA)}>{SCMType.GITEA}</button>
            </div>
            <div style={{display: 'flex', gap: '1rem', margin: '1rem'}}>
                <SCMInfo type={SCM}  setRepoCredential={setRepoCredential}/>
            </div>
            {!!repocredential && <div>{JSON.stringify(repocredential)}</div>}
            <button style={{
                background: repocredential !== undefined ? 'skyblue':'gray',
                border: '1px solid black',
                borderRadius: '5px',
                padding: '5px',
                cursor: repocredential !== undefined ? 'pointer' : 'not-allowed',
            }} onClick={() => {
                if (repocredential !== undefined){
                    setStatus((prevState)=>{return !prevState})
                }
            }}>{status ? "Stop": repocredential !== undefined ? 'Start': 'NotReady'}</button>
            {status ? (<>
                <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', margin: '1rem'}}>
                    <button style={{
                        background: mode === Mode.FULL ? 'skyblue':'aliceblue',
                        border: '1px solid black',
                        borderRadius: '5px',
                        padding: '5px',
                        cursor: 'pointer',
                    }} onClick={() => setMode(Mode.FULL)}>{Mode.FULL}</button>
                    <button style={{
                        background: mode === Mode.OnlyGraph ? 'skyblue':'aliceblue',
                        border: '1px solid black',
                        borderRadius: '5px',
                        padding: '5px',
                        cursor: 'pointer',
                    }} onClick={() => setMode(Mode.OnlyGraph)}>{Mode.OnlyGraph}</button>
                </div>
                {mode === Mode.FULL && (<FullView  repoInformation={repocredential}/>)}
                {mode === Mode.OnlyGraph && (<OnlyGraphView repoInformation={repocredential}/>)}
            </> ): null}
        </div>
    )
}