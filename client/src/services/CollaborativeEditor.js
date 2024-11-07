import React, { useState, useEffect, useRef } from 'react';

function CollaborativeEditor() {
    const [text, setText] = useState('');
    const ws = useRef(null);

    useEffect(() => {
        // WebSocket 연결
        ws.current = new WebSocket("ws://localhost:8080/ws/edit");

        ws.current.onmessage = (event) => {
            setText(event.data); // 수신된 메시지를 텍스트에 반영
        };

        ws.current.onclose = () => {
            console.log("WebSocket connection closed");
        };

        return () => {
            ws.current.close();
        };
    }, []);

    // 텍스트 변경 시 웹소켓으로 전송
    const handleChange = (e) => {
        setText(e.target.value);
        if (ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(e.target.value);
        }
    };

    return (
        <div>
            <h2>Collaborative Editor</h2>
            <textarea
                value={text}
                onChange={handleChange}
                placeholder="Start typing..."
                rows="10"
                cols="50"
            />
        </div>
    );
}

export default CollaborativeEditor;