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
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@ServerEndpoint("/socket/meeting")
public class WebSocketMeeting {
    private static Set<Session> clients = Collections.synchronizedSet(ConcurrentHashMap.newKeySet());
    private static Map<Session, String> sessionNicknameMap = new ConcurrentHashMap<>();
    private static Logger logger = LoggerFactory.getLogger(WebSocketMeeting.class);

    @OnOpen
    public void onOpen(Session session) {
        logger.info("New session connected: {}", session);
        clients.add(session);
    }

    @OnMessage
    public void onMessage(String message, Session session) throws IOException {
        logger.info("Message received: {}", message);

        if (message.startsWith("nickname:")) {
            String nickname = message.substring(9).trim();

            if (sessionNicknameMap.containsValue(nickname)) {
                session.getBasicRemote().sendText("error:이미 사용 중인 닉네임입니다.");
                return;
            }

            sessionNicknameMap.put(session, nickname);
            logger.info("New nickname added: {}", nickname);

            // 브로드캐스트로 닉네임 업데이트
            broadcast("nicknames:" + String.join(", ", sessionNicknameMap.values()));

        } else if (message.startsWith("leave:")) {
            handleClientLeave(session);
        } else {
            broadcast(message); // 일반 메시지 브로드캐스팅
        }
    }

    @OnClose
    public void onClose(Session session) {
        logger.info("Session closed: {}", session);
        handleClientLeave(session);
    }

    private void handleClientLeave(Session session) {
        String nickname = sessionNicknameMap.remove(session);
        if (nickname != null) {
            logger.info("Client left: {}", nickname);
            clients.remove(session);

            try {
                broadcast("leave:" + nickname + "님이 회의에서 나갔습니다.");
                broadcast("nicknames:" + String.join(", ", sessionNicknameMap.values()));
            } catch (IOException e) {
                logger.error("Error broadcasting leave message", e);
            }
        }
    }

    private void broadcast(String message) throws IOException {
        synchronized (clients) {
            for (Session client : clients) {
                if (client.isOpen()) {
                    client.getBasicRemote().sendText(message);
                }
            }
        }
    }
}