import React, { useState, useEffect, useRef } from 'react';
import './CollaborativeEditor.css';

function CollaborativeEditor() {
    const [agenda, setAgenda] = useState('');
    const [notes, setNotes] = useState('');
    const [results, setResults] = useState('');
    const [meetingDate, setMeetingDate] = useState(new Date().toISOString().slice(0, 10));
    const [attendees, setAttendees] = useState('');
    const ws = useRef(null);
    const isComposing = useRef(false); 
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

    const handleComposition = (event) => {
        isComposing.current = event.type !== 'compositionend';

        // 조합이 끝났을 때 최종 상태를 서버에 전송
        if (event.type === 'compositionend' && ws.current.readyState === WebSocket.OPEN) {
            const type = event.target.getAttribute("data-type");
            const message = JSON.stringify({ type, content: event.target.value });
            ws.current.send(message);
        }
    };

    const handleChange = (e, type) => {
        const updatedText = e.target.value;

        if (type === "agenda") setAgenda(updatedText);
        else if (type === "notes") setNotes(updatedText);
        else if (type === "results") setResults(updatedText);

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(() => {
            // 한글 조합 중이 아닐 때마다 WebSocket 전송
            if (ws.current.readyState === WebSocket.OPEN) {
                const message = JSON.stringify({ type, content: updatedText });
                ws.current.send(message);
            }
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
                    onCompositionStart={handleComposition}
                    onCompositionEnd={handleComposition}
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
                    onCompositionStart={handleComposition}
                    onCompositionEnd={handleComposition}
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
                    onCompositionStart={handleComposition}
                    onCompositionEnd={handleComposition}
                    placeholder="회의 결과를 여기에 작성하세요!"
                    rows="12"
                />
            </div>

            <button className="save-button">저장하기</button>
        </div>
    );
}

export default CollaborativeEditor;