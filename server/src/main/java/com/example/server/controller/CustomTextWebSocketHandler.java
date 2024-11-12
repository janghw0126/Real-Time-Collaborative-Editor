package com.example.server.controller;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

// 실시간 메시지 전송을 관리하는 핸들러
// 클라이언트의 연결, 메시지 처리, 연결 종료 시 동작을 정의함
public class CustomTextWebSocketHandler extends TextWebSocketHandler {

    // 현재 연결된 WebSocket 세션을 저장하는 Set
    // ConcurrentHashMap을 사용하여 스레드 안정성을 보장함
    private final Set<WebSocketSession> sessions = Collections.newSetFromMap(new ConcurrentHashMap<>());

    // 클라이언트가 WebSocket에 연결되었을 때 호출됨
    // 새로운 세션을 sessions Set에 추가하여 추적함
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
    }

    // 클라이언트가 메시지를 전송할 때 호출됨
    // 각 세션에 대해 현재 세션을 제외한 모든 연결된 세션에 메시지를 전송함
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        synchronized (sessions) {
            // HashSet으로 복사본을 만들어 순화하여 안정성을 확보함
            for (WebSocketSession wsSession : new HashSet<>(sessions)) {
                try {
                    // 세션이 열려 있고, 메시지를 전송한 세션이 아닌 경우에만 메시지를 전송함
                    if (wsSession.isOpen() && !wsSession.equals(session)) {
                        // 다른 사용자에게 메시지 전송
                        wsSession.sendMessage(message);
                    }
                } catch (Exception e) {
                    // 메시지 전송 실패시 오류 메시지를 출력함
                    System.err.println("Error sending message to sesstion: " + wsSession.getId());
                }
            }
        }
    }

    // 클라이언트와의 WebSocket 연결이 종료되었을 때 호출됨
    // 종료된 세션을 sessions Set에서 제거하여 관리함
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
    }
}

