import React, { useState, useEffect, useRef } from 'react';
import './CollaborativeEditor.css';

function CollaborativeEditor() {
    // 상태변수 분류
    const [agenda, setAgenda] = useState(''); // 회의 안건 내용
    const [notes, setNotes] = useState(''); // 회의 내용
    const ws = useRef(null); // WebSocket 객체를 ref로 저장하여 연결 유지

    useEffect(() => {
        console.log("CollaborativeEditor mounted");

        // WebSocket 연결
        ws.current = new WebSocket("ws://localhost:8080/socket/meeting");

        // 서버에서 메시지가 오면 해당 텍스트를 업데이트
        ws.current.onmessage = (event) => {
            // JSON 데이터 파싱
            const message = JSON.parse(event.data);
            if (message.type === "agenda") {
                setAgenda(message.content); // 회의 안건 업데이트
            } else if (message.type === "notes") {
                setNotes(message.content); // 회의 내용 업데이트
            }
        };

        // WebSocket 연결이 끊어졌을 때
        ws.current.onclose = () => {
            console.log("WebSocket connection closed");
        };

        // 컴포넌트가 언마운트 될 때 WebSocket 연결을 닫음
        return () => {
            ws.current.close();
        };
    }, []);

    // 텍스트 변경 시 실시간으로 WebSocket으로 전송
    const handleChange = (e,type) => {
        const updatedText = e.target.value; // 입력된 텍스트 상태 업데이트

        // 해당 타입에 맞는 상태 업데이트
        if (type === "agenda") {
            setAgenda(updatedText);
        } else if (type === "notes") {
            setNotes(updatedText);
        }

        // WebSocket 연결이 열려 있으면 텍스트를 서버로 전송
        if (ws.current.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({
                type: type, // 데이터의 타입 (agenda 또는 notes)
                content: updatedText, // 텍스트 내용
            });
            ws.current.send(message); // 서버로 전송
        }
    };

    return (
        <div>
            <h1>회의록🤪</h1>
            <div>
            <text>✅날짜 넣기</text>
            <br></br>
            <text>✅참석자 명단 넣기(닉네임)</text>
            </div>
            <h3>🌱회의 안건</h3>
            <text>회의 때 논의할 안건들을 기입하세요.</text>
            <br></br>
            <br></br>
            <textarea
                value={agenda} // 회의 안건 상태 값 바인딩
                onChange={(e) => handleChange(e, "agenda")} // 텍스트 변경 시 WebSocket으로 데이터 전송
                placeholder="여기에 회의록을 작성하세요..."
                rows="10"
                cols="50"
            />
            <h3>✏️회의록</h3>
            <text>회의 중 논의된 내용들을 기입해주세요.</text>
            <br></br>
            <br></br>
            <textarea
                value={notes} // 회의 내용 상태 값 바인딩
                onChange={(e) => handleChange(e, "notes")} // 텍스트 변경 시 WebSocket으로 데이터 전송
                placeholder="여기에 회의록을 작성하세요..."
                rows="10"
                cols="50"
            />
        </div>
    );
}

export default CollaborativeEditor;