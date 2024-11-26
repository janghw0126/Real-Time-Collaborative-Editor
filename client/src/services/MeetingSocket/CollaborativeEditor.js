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
    const [isParticipantsListVisible, setIsParticipantsListVisible] = useState(false); // 토글 상태 추가
    const ws = useRef(null);
    const debounceTimeout = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:8080/socket/meeting");
    
        ws.current.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === "agenda") setAgenda(message.content);
                else if (message.type === "notes") setNotes(message.content);
                else if (message.type === "results") setResults(message.content);
            } catch (error) {
                // JSON 파싱 실패한 메시지 처리
                if (event.data.startsWith("nicknames:")) {
                    const nicknameList = event.data.substring(10).split(", ");
                    setNicknameMessages((prevMessages) => {
                        // 1. 기존 닉네임만 추출
                        const existingNicknames = prevMessages;
    
                        // 2. 새로운 닉네임 중 중복되지 않은 닉네임만 추가
                        const uniqueNicknames = nicknameList.filter(
                            (nickname) => !existingNicknames.includes(nickname)
                        );
    
                        // 3. 기존 메시지에 새로운 닉네임 추가
                        return [...prevMessages, ...uniqueNicknames];
                    });
                } else {
                    console.error("Unrecognized message format:", event.data);
                }
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

    const sendMessage = (content, type) => {
        if (ws.current.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({ type, content });
            ws.current.send(message);
        }
    };

    const handleKeyDown = (event, type) => {
        if (event.key === 'Enter' && event.nativeEvent.isComposing === false) {
            const content = event.target.value;
            sendMessage(content, type);

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

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(() => {
            sendMessage(updatedText, type);
        }, 200);
    };

    const toggleParticipantsList = () => {
        setIsParticipantsListVisible(prevState => !prevState); // 토글 상태 변경
    };

    return (
        <div className="collaborative-editor">
            {/* 회의 참여자 섹션 */}
            <section className="participants-section">
                <h2>회의 참여 상태</h2>
                <ul className="participant-list">
                    {nicknameMessages.map((nickname, index) => (
                        <li key={index}>{`${nickname}님이 회의에 참여하였습니다.`}</li>
                    ))}
                </ul>
            </section>

            {/* 회의록 섹션 */}
            <section className="editor-section">
                <h1>회의록📋</h1>
                <div className="meeting-info">
                    <label>
                        <strong>📅 회의 날짜 :</strong>
                        <input
                            type="date"
                            value={meetingDate}
                            onChange={(e) => setMeetingDate(e.target.value)}
                        />
                    </label>
                    <label>
                        <strong>👀 참여자 목록 : </strong>
                        <button className="toggle-participants" onClick={toggleParticipantsList}>
                            {isParticipantsListVisible ? '참여자 목록 숨기기' : '참여자 목록 보기'}
                        </button>
                    </label>
                </div>

                {/* 회의 참여자 목록 섹션 */}
                {isParticipantsListVisible && (
                    <section className="participants-section">
                        <div className="participant-list-container">
                            <ul className="participant-list">
                                {nicknameMessages.map((nickname, index) => (
                                    <li key={index}>{nickname}님</li>
                                ))}
                            </ul>
                        </div>
                    </section>
                )}

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