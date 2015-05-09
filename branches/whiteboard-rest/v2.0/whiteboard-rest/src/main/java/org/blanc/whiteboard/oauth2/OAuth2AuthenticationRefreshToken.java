package org.blanc.whiteboard.oauth2;

import org.blanc.whiteboard.persistence.BaseEntity;
import org.springframework.security.oauth2.common.OAuth2RefreshToken;
import org.springframework.security.oauth2.provider.OAuth2Authentication;

public class OAuth2AuthenticationRefreshToken extends BaseEntity {

	private static final long serialVersionUID = 1L;
	private String tokenId;
    private OAuth2RefreshToken oAuth2RefreshToken;
    private OAuth2Authentication authentication;

    public OAuth2AuthenticationRefreshToken(OAuth2RefreshToken oAuth2RefreshToken, OAuth2Authentication authentication) {
        this.oAuth2RefreshToken = oAuth2RefreshToken;
        this.authentication = authentication;
        this.tokenId = oAuth2RefreshToken.getValue();
    }

    public String getTokenId() {
        return tokenId;
    }

    public OAuth2RefreshToken getoAuth2RefreshToken() {
        return oAuth2RefreshToken;
    }

    public OAuth2Authentication getAuthentication() {
        return authentication;
    }
}
