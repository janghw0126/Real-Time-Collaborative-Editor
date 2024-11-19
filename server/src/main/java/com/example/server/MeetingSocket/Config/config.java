package com.example.server.MeetingSocket.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;

// WebSocket 설정을 위한 Config 클래스
// 서버에서 WebSocket endpoint를 설정하고 초기화하는 역할을 수행함
@Component
public class config {
    // Bean을 생성하여 스프링 부트가 WebSocket을 처리할 수 있도록 함
    // Spring Boot 내장 WAS에서 WebSocket endpoint를 활성화하고 관리하는 데 사용됨
    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        // ServerEndpointExporter 객체를 반환
        return new ServerEndpointExporter();
    }
}

