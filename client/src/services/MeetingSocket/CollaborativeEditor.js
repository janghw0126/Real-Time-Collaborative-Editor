import React, { useState, useEffect, useRef } from 'react';
import './CollaborativeEditor.css';

function CollaborativeEditor() {
    const [agenda, setAgenda] = useState('');
    const [notes, setNotes] = useState('');
    const [results, setResults] = useState('');
    const [meetingDate, setMeetingDate] = useState(new Date().toISOString().slice(0, 10));
    const [nicknameInput, setNicknameInput] = useState('');
    const [nicknameMessages, setNicknameMessages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(true);
    const ws = useRef(null);
    const debounceTimeout = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:8080/socket/meeting");

        ws.current.onmessage = (event) => {
            const message = event.data;
            if (message.startsWith("nicknames:")) {
                const nicknameList = message.substring(10).split(", ");
                const newMessages = nicknameList.map((nickname) => `${nickname}님이 회의에 참여하였습니다.`);
                setNicknameMessages(newMessages);
            }
        };

        ws.current.onclose = () => console.log("WebSocket connection closed");

        return () => ws.current.close();
    }, []);

    const handleModalSubmit = () => {
        if (nicknameInput.trim() && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(`nickname:${nicknameInput.trim()}`);
            setIsModalOpen(false);
        }
    };    

    return (
        <div className="collaborative-editor">
            {/* 참여 메시지 섹션 */}
            <section className="participants-section">
                <h4>참여 메시지</h4>
                <ul>
                    {nicknameMessages.map((msg, index) => (
                        <li key={index}>{msg}</li>
                    ))}
                </ul>
                <br></br>
            </section>

            {/* 회의록 섹션 */}
            <section className="editor-section">
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
                </div>

                <div className="agenda-section">
                    <h3>🌱 회의 안건</h3>
                    <textarea
                        value={agenda}
                        onChange={(e) => setAgenda(e.target.value)}
                        placeholder="회의 안건을 여기에 작성하세요!"
                        rows="6"
                    />
                </div>

                <div className="notes-section">
                    <h3>✏️ 회의록</h3>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="회의 내용을 여기에 작성하세요!"
                        rows="12"
                    />
                </div>

                <div className="results-section">
                    <h3>☑️ 회의 결과</h3>
                    <textarea
                        value={results}
                        onChange={(e) => setResults(e.target.value)}
                        placeholder="회의 결과를 여기에 작성하세요!"
                        rows="12"
                    />
                </div>
                <button className="save-button">저장하기</button>
            </section>

            {/* 닉네임 설정 모달 */}
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Enter your Name!</h2>
                        <input
                            type="text"
                            value={nicknameInput}
                            onChange={(e) => setNicknameInput(e.target.value)}
                            placeholder="회의에 사용될 이름을 입력하세요."
                        />
                        <button onClick={handleModalSubmit}>확인</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CollaborativeEditor;