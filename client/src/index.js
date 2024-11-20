import React from 'react';
import ReactDOM from 'react-dom';
import CollaborativeEditor from './services/MeetingSocket/CollaborativeEditor'; 
import './index.css';
import './index.css';
import reportWebVitals from './reportWebVitals';
import App from './App';  

ReactDOM.render(
  <React.StrictMode>
    <CollaborativeEditor />
  </React.StrictMode>,
  document.getElementById('root')
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    <CollaborativeEditor />  {/* CollaborativeEditor 컴포넌트 렌더링 */}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
