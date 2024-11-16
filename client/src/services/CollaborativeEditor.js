import React, { useState, useEffect, useRef } from 'react';

function CollaborativeEditor() {
<<<<<<< Updated upstream
    const [text, setText] = useState(''); // 회의록 내용
=======
    // 상태변수 분류
    const isComposing = useRef(false);
    const [agenda, setAgenda] = useState(''); // 회의 안건
    const [notes, setNotes] = useState(''); // 회의 내용
    const [results,setResults] = useState(''); // 회의 결과
    const [meetingDate, setMeetingDate] = useState(new Date().toISOString().slice(0, 10)); // 회의 날짜
    const [attendees, setAttendees] = useState(''); // 참석자 명단 // 회의 내용
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
    // 텍스트 변경 시 실시간으로 WebSocket으로 전송
    const handleChange = (e) => {
        setText(e.target.value); // 입력된 텍스트 상태 업데이트
        if (ws.current.readyState === WebSocket.OPEN) {
            // WebSocket 연결이 열려 있으면 텍스트를 서버로 전송
            ws.current.send(e.target.value);
=======
    // 한글 입력 중 상태 변경 관리
    const handleComposition = (e, type) => {
        if (e.type === 'compositionstart') {
            isComposing.current = true; // 조합 시작
        } else if (e.type === 'compositionend') {
            isComposing.current = false; // 조합 완료
            // 조합 완료 시 WebSocket에 최종 데이터 전송
            if (ws.current.readyState === WebSocket.OPEN) {
                const message = JSON.stringify({
                    type,
                    content: e.target.value,
                });
                ws.current.send(message);
            }
        }
    };

    // 텍스트 변경 시 실시간으로 WebSocket으로 전송
    const handleChange = (e, type) => {
        const updatedText = e.target.value;
    
        if (type === "agenda") setAgenda(updatedText);
        else if (type === "notes") setNotes(updatedText);
        else if (type === "results") setResults(updatedText);
    
        // 조합 중이 아닐 때만 WebSocket 전송
        if (!isComposing.current && ws.current.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({
                type,
                content: updatedText,
            });
            ws.current.send(message);
>>>>>>> Stashed changes
        }
    };

    return (
<<<<<<< Updated upstream
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
=======
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
                        onCompositionStart={handleComposition}
                        onCompositionEnd={handleComposition}
                    />
                </label>
            </div>
            <div className="agenda-section">
                <h3>🌱 회의 안건</h3>
                <textarea
                    data-type="agenda"
                    value={agenda}
                    onChange={(e) => handleChange(e, "agenda")}
                    onCompositionStart={(e) => handleComposition(e, "agenda")}
                    onCompositionEnd={(e) => handleComposition(e, "agenda")}
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
>>>>>>> Stashed changes
        </div>
    );
}

export default CollaborativeEditor;