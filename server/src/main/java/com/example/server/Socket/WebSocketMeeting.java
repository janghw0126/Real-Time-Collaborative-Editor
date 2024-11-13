package com.example.server.Socket;

import jakarta.websocket.OnClose;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.ServerEndpoint;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

// websoket 서버 구현
@Service
@ServerEndpoint("/socket/meeting")
public class WebSocketMeeting {
    // websocket에 연결된 클라이언트 세션을 저장하는 동기화된 Set
    private static Set<Session> clients = Collections.synchronizedSet(new HashSet<Session>());
    // 로깅을 위한 Logger 인스턴스
    private static Logger logger = LoggerFactory.getLogger(WebSocketMeeting.class);

    // 클라이언트가 WebSocket에 연결될 때 호출되는 메서드
    // 세션 정보를 받음
    @OnOpen
    public void onOpen(Session session) {
        logger.info("open session : {}, clients={}", session.toString(), clients);

        // 새로운 세션을 clients sets에 추가
        if(!clients.contains(session)) {
            clients.add(session);
            logger.info("session open : {}", session);
        }else{
            logger.info("이미 연결된 session");
        }
    }

    // 클라이언트가 메시지를 보낼 때 호출되는 메서드
    // 클라이언트가 보낸 메시지와 세션정보, IOException 발생가능을 받음
    @OnMessage
    public void onMessage(String message, Session session) throws IOException {
        logger.info("receive message : {}", message);

        // 모든 클라이언트에게 메시지를 전송
        for (Session s : clients) {
            logger.info("send data : {}", message);

            s.getBasicRemote().sendText(message);
        }
    }

    // 클라이언트와의 WebSocket 연결이 닫힐 때 호출되는 메서드
    // 연결이 종료된 클라이언트의 세션 정보를 받음
    @OnClose
    public void onClose(Session session) {
        logger.info("session close : {}", session);
        // 연결이 종료된 세션을 client Sets에서 제거
        clients.remove(session);
    }
}