import { useState } from "react";
import { FullView } from "./FullView.tsx";
import {OnlyGraphView} from "./OnlyGraphView.tsx";

const Mode = {
    FULL: "FULL",
    OnlyGraph: "OnlyGraph",
} as const;

export const ModeSwitchView = () => {
    const [mode, setMode] = useState<string>(Mode.FULL);
    return (
        <div style={{ display: "flex", flexDirection: "column" , width: '70%', height: '100%'}}>
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
                {mode === Mode.FULL && (<FullView/>)}
                {mode === Mode.OnlyGraph && (<OnlyGraphView/>)}
        </div>
    )
}