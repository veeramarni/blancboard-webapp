package org.blanc.whiteboard.mail;

import org.springframework.integration.annotation.Gateway;


public interface EmailServicesGateway {

    @Gateway(requestChannel = "emailVerificationRouterChannel")
    public void sendVerificationToken(EmailServiceTokenModel model);
}
