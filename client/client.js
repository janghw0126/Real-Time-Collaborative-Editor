// import React, { useState, useEffect, useRef } from 'react';

// function CollaborativeEditor() {
//   const [text, setText] = useState('');
//   const ws = useRef(null);

//   useEffect(() => {
//     // WebSocket 연결 설정
//     ws.current = new WebSocket("ws://localhost:8080/ws");

//     ws.current.onopen = () => {
//       console.log("WebSocket connected");
//     };

//     ws.current.onmessage = (event) => {
//       setText(prevText => prevText + event.data);
//     };

//     ws.current.onclose = () => {
//       console.log("WebSocket disconnected");
//     };

//     return () => {
//       ws.current.close();
//     };
//   }, []);

//   const handleChange = (event) => {
//     const newChar = event.target.value.slice(-1); // 마지막 입력된 글자만 추출
//     setText(event.target.value); 
//     ws.current.send(newChar); // 새 글자만 서버로 전송
//   };

//   return (
//     <div>
//       <h2>실시간 협업 에디터</h2>
//       <textarea
//         value={text}
//         onChange={handleChange}
//         rows="10"
//         cols="50"
//         placeholder="회의 내용을 입력하세요."
//       />
//     </div>
//   );
// }

// export default CollaborativeEditor;