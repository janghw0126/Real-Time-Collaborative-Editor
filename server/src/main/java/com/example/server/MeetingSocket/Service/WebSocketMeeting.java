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
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@ServerEndpoint("/socket/meeting")
public class WebSocketMeeting {
    private static Set<Session> clients = Collections.synchronizedSet(ConcurrentHashMap.newKeySet());
    private static Map<Session, String> sessionNicknameMap = new ConcurrentHashMap<>();
    private static Logger logger = LoggerFactory.getLogger(WebSocketMeeting.class);
    private static Map<Session, String> meetingNotes = new ConcurrentHashMap<>(); // 전체 회의록 저장

    // 새로운 클라이언트가 접속할 때 호출됩니다.
    @OnOpen
    public void onOpen(Session session) {
        logger.info("New session connected: {}", session);
        clients.add(session);

        // 새로 접속한 클라이언트에게 현재 참여자 목록을 전송
        sendCurrentParticipants(session);
        sendCurrentContents(session);
    }

    // 클라이언트로부터 메시지를 받았을 때 호출됩니다.
    @OnMessage
    public void onMessage(String message, Session session) throws IOException {
        logger.info("Message received: {}", message);

        if (message.startsWith("nickname:")) {
            // 닉네임 설정
            String nickname = message.substring(9).trim();

            if (sessionNicknameMap.containsValue(nickname)) {
                session.getBasicRemote().sendText("error:이미 사용 중인 닉네임입니다.");
                return;
            }

            sessionNicknameMap.put(session, nickname);
            logger.info("New nickname added: {}", nickname);

            // 닉네임 업데이트를 브로드캐스트
            broadcast("nicknames:" + String.join(", ", sessionNicknameMap.values()));
        } else if (message.startsWith("leave:")) {
            // 클라이언트가 나갈 때 처리
            handleClientLeave(session);
        } else {
            // 일반 메시지 브로드캐스팅
            broadcast(message);
        }
    }

    // 클라이언트가 소켓을 닫을 때 호출됩니다.
    @OnClose
    public void onClose(Session session) {
        logger.info("Session closed: {}", session);
        handleClientLeave(session);
    }

    // 클라이언트가 회의를 떠났을 때 처리하는 메서드
    private void handleClientLeave(Session session) {
        String nickname = sessionNicknameMap.remove(session);
        if (nickname != null) {
            logger.info("Client left: {}", nickname);
            clients.remove(session);

            try {
                // 회의에서 나갔음을 브로드캐스트
                broadcast("leave:" + nickname + "님이 회의에서 나갔습니다.");
                // 참여자 목록을 다시 브로드캐스트
                broadcast("nicknames:" + String.join(", ", sessionNicknameMap.values()));
            } catch (IOException e) {
                logger.error("Error broadcasting leave message", e);
            }
        }
    }

    // 모든 클라이언트에게 메시지를 브로드캐스트하는 메서드
    private void broadcast(String message) throws IOException {
        synchronized (clients) {
            for (Session client : clients) {
                if (client.isOpen()) {
                    client.getBasicRemote().sendText(message);
                }
            }
        }
    }

    // 새로 접속한 클라이언트에게 현재 참여자 목록을 전송하는 메서드
    private void sendCurrentParticipants(Session session) {
        try {
            // 현재 참여자 목록을 전송
            session.getBasicRemote().sendText("nicknames:" + String.join(", ", sessionNicknameMap.values()));
        } catch (IOException e) {
            logger.error("Error sending current participants", e);
        }
    }

    // 새로 접속한 클라이언트에게 현재 회의록 내용을 전송하는 메서드
    private void sendCurrentContents(Session session) {
        try{
            //회의 카테고리별로 나눠서 데이터 전송하기
            
            
            session.getBasicRemote().sendText("contents:" + String.join(",", meetingNotes.values()));
        } catch (IOException e) {
            logger.error("Error sending current contents", e);
        }
    }
}