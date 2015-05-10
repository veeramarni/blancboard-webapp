package org.blanc.whiteboard.user.api;

import org.blanc.whiteboard.user.User;
import org.springframework.security.oauth2.common.OAuth2AccessToken;

import javax.xml.bind.annotation.XmlRootElement;

import static org.springframework.util.Assert.notNull;


@XmlRootElement
public class CreateUserResponse {

    private ApiUser apiUser;
    private OAuth2AccessToken oAuth2AccessToken;

    public CreateUserResponse(){}

    public CreateUserResponse(final ApiUser user, OAuth2AccessToken oAuth2AccessToken) {
        
        notNull(user, "Mandatory argument 'user' missing.");
        notNull(oAuth2AccessToken, "Mandatory argument 'oAuth2AccessToken' missing.");
        this.apiUser = user;
        this.oAuth2AccessToken = oAuth2AccessToken;
    }

    public ApiUser getApiUser() {
        return apiUser;
    }

    public OAuth2AccessToken getOAuth2AccessToken() {
        return oAuth2AccessToken;
    }
}
