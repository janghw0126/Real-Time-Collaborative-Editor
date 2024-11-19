import React, { useState, useEffect, useRef } from 'react';
import './CollaborativeEditor.css';

function CollaborativeEditor() {
    const [agenda, setAgenda] = useState('');
    const [notes, setNotes] = useState('');
    const [results, setResults] = useState('');
    const [meetingDate, setMeetingDate] = useState(new Date().toISOString().slice(0, 10));
    const [attendees, setAttendees] = useState('');
    const ws = useRef(null);
    const debounceTimeout = useRef(null); // WebSocket 전송 지연 시간

    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:8080/socket/meeting");

        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === "agenda") setAgenda(message.content);
            else if (message.type === "notes") setNotes(message.content);
            else if (message.type === "results") setResults(message.content);
        };

        ws.current.onclose = () => console.log("WebSocket connection closed");
        return () => ws.current.close();
    }, []);
    const sendMessage = (content, type) => {
        if (ws.current.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({ type, content });
            ws.current.send(message);
        }
    };

    const handleKeyDown = (event, type) => {
        // IME 입력 상태를 확인하여 조합 중일 때 전송하지 않음
        if (event.key === 'Enter' && event.nativeEvent.isComposing === false) {
            const content = event.target.value;
            sendMessage(content, type);

            // 상태 업데이트
            if (type === "agenda") setAgenda(content);
            else if (type === "notes") setNotes(content);
            else if (type === "results") setResults(content);
        }
    };

    const handleChange = (event, type) => {
        const updatedText = event.target.value;

        if (type === "agenda") setAgenda(updatedText);
        else if (type === "notes") setNotes(updatedText);
        else if (type === "results") setResults(updatedText);

        // WebSocket 메시지 전송 지연 처리
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(() => {
            sendMessage(updatedText, type);
        }, 200); // 입력 후 200ms 뒤 전송
    };

    return (
        <div className="container">
            <h1>회의록📋</h1>
            <div className="meeting-info">
                <label>
                    <strong>📅 회의 날짜:</strong>
                    <input
                        type="date"
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                    />
                </label>
                <br></br>
                <label>
                    <strong>👥 참석자 명단:</strong>
                    <input
                        type="text"
                        placeholder="참석자 이름 입력 (예: 홍길동, 김철수)"
                        value={attendees}
                        onChange={(e) => setAttendees(e.target.value)}
                    />
                </label>
            </div>
            <div className="agenda-section">
                <h3>🌱 회의 안건</h3>
                <textarea
                    data-type="agenda"
                    value={agenda}
                    onChange={(e) => handleChange(e, "agenda")}
                    onKeyDown={(e) => handleKeyDown(e, "agenda")}
                    placeholder="회의 안건을 여기에 작성하세요!"
                    rows="6"
                />
            </div>
            <div className="notes-section">
                <h3>✏️ 회의록</h3>
                <textarea
                    data-type="notes"
                    value={notes}
                    onChange={(e) => handleChange(e, "notes")}
                    onKeyDown={(e) => handleKeyDown(e, "notes")}
                    placeholder="회의 내용을 여기에 작성하세요!"
                    rows="12"
                />
            </div>
            <div className="results-section">
                <h3>☑️ 회의 결과</h3>
                <textarea
                    data-type="results"
                    value={results}
                    onChange={(e) => handleChange(e, "results")}
                    onKeyDown={(e) => handleKeyDown(e, "results")}
                    placeholder="회의 결과를 여기에 작성하세요!"
                    rows="12"
                />
            </div>
            <button className="save-button">저장하기</button>
        </div>
    );
}

export default CollaborativeEditor;