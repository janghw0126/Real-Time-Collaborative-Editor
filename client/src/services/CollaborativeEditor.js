import React, { useState, useEffect, useRef } from 'react';
import './CollaborativeEditor.css';

function CollaborativeEditor() {
    // 상태변수 분류
    const [agenda, setAgenda] = useState(''); // 회의 안건
    const [notes, setNotes] = useState(''); // 회의 내용
    const [results,setResults] = useState(''); // 회의 결과
    const [meetingDate, setMeetingDate] = useState(new Date().toISOString().slice(0, 10)); // 회의 날짜
    const [attendees, setAttendees] = useState(''); // 참석자 명단 // 회의 내용
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
            else if (message.type === "results") {
                setResults(message.content); // 회의 내용 업데이트
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
        } else if (type === "results") {
            setResults(updatedText);
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
                    value={agenda}
                    onChange={(e) => handleChange(e, "agenda")}
                    placeholder="회의 안건을 여기에 작성하세요!"
                    rows="6"
                />
            </div>
            <div className="notes-section">
                <h3>✏️ 회의록</h3>
                <textarea
                    value={notes}
                    onChange={(e) => handleChange(e, "notes")}
                    placeholder="회의 내용을 여기에 작성하세요!"
                    rows="12"
                />
            </div>
            <div className="results-section">
                <h3>☑️ 회의 결과</h3>
                <textarea
                    value={results}
                    onChange={(e) => handleChange(e, "results")}
                    placeholder="회의 결과를 여기에 작성하세요!"
                    rows="12"
                />
            </div>


            <button className="save-button">저장하기</button>
        </div>
    );
}

export default CollaborativeEditor;