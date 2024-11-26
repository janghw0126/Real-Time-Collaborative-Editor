package com.example.server.MeetingSocket.Service;

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

@Service
@ServerEndpoint("/socket/meeting")
public class WebSocketMeeting {
    private static Set<Session> clients = Collections.synchronizedSet(new HashSet<>());
    private static Set<String> nicknames = Collections.synchronizedSet(new HashSet<>());  // 닉네임 목록
    private static Logger logger = LoggerFactory.getLogger(WebSocketMeeting.class);

    @OnOpen
    public void onOpen(Session session) {
        logger.info("open session : {}, clients={}", session.toString(), clients);

        // 새로운 세션을 clients set에 추가
        if (!clients.contains(session)) {
            clients.add(session);
            logger.info("session open : {}", session);
        } else {
            logger.info("이미 연결된 session");
        }
    }

    @OnMessage
    public void onMessage(String message, Session session) throws IOException {
        logger.info("receive message : {}", message);

        // 닉네임을 설정할 때 (입력한 닉네임을 세션에 저장)
        if (message.startsWith("nickname:")) {
            String nickname = message.substring(9);  // "nickname:" 뒤의 내용이 닉네임
            nicknames.add(nickname);
            logger.info("New nickname added: {}", nickname);

            // 모든 클라이언트에게 닉네임 목록을 전송
            for (Session s : clients) {
                s.getBasicRemote().sendText("nicknames:" + String.join(", ", nicknames));
            }
        } else {
            // 회의록에 대한 메시지 처리 (기존의 메시지 처리 방식 유지)
            for (Session s : clients) {
                s.getBasicRemote().sendText(message);
            }
        }
    }

    @OnClose
    public void onClose(Session session) {
        logger.info("session close : {}", session);
        // 연결이 종료된 세션을 clients set에서 제거
        clients.remove(session);
    }
}
