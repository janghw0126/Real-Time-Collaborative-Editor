import React, { useState, useEffect, useRef } from 'react';

function CollaborativeEditor() {
    const [text, setText] = useState(''); // 회의록 내용
    const ws = useRef(null); // WebSocket 객체를 ref로 저장하여 연결 유지

    useEffect(() => {
        console.log("CollaborativeEditor mounted");

        // WebSocket 연결
        ws.current = new WebSocket("ws://localhost:8080/socket/meeting");

        // 서버에서 메시지가 오면 해당 텍스트를 업데이트
        ws.current.onmessage = (event) => {
            setText(event.data); // 서버에서 받은 데이터를 텍스트 영역에 반영
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
    const handleChange = (e) => {
        setText(e.target.value); // 입력된 텍스트 상태 업데이트
        if (ws.current.readyState === WebSocket.OPEN) {
            // WebSocket 연결이 열려 있으면 텍스트를 서버로 전송
            ws.current.send(e.target.value);
        }
    };

    return (
        <div>
            <h1>오늘 회의🤪</h1>
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
                value={text} // 텍스트 상태 값 바인딩
                onChange={handleChange} // 텍스트 변경 시 WebSocket으로 데이터 전송
                placeholder="여기에 회의록을 작성하세요..."
                rows="10"
                cols="50"
            />
            <h3>✏️회의록</h3>
            <text>회의 중 논의된 내용들을 기입해주세요.</text>
            <br></br>
            <br></br>
            <textarea
                value={text} // 텍스트 상태 값 바인딩
                onChange={handleChange} // 텍스트 변경 시 WebSocket으로 데이터 전송
                placeholder="여기에 회의록을 작성하세요..."
                rows="10"
                cols="50"
            />
        </div>
    );
}

export default CollaborativeEditor;