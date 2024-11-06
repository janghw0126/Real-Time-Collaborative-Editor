package controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class DocumentController {

    @MessageMapping("/edit") // 클라이언트로부터 수신하는 엔드포인트
    @SendTo("/topic/document") // 다른 클라이언트에게 전송
    public String handleEdit(String content) {
        // 서버에서 추가적인 작업이 필요할 경우 처리
        return content;
    }
}

