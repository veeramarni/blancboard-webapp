package org.blanc.whiteboard.user.api;

import javax.xml.bind.annotation.XmlRootElement;


@XmlRootElement
public class LoginResponse {

    private ApiUser apiUser;
    private CreateUserResponse authenticatedUserToken;

    public ApiUser getApiUser() {
        return apiUser;
    }

    public void setApiUser(ApiUser apiUser) {
        this.apiUser = apiUser;
    }

    public CreateUserResponse getAuthenticatedUserToken() {
        return authenticatedUserToken;
    }

    public void setAuthenticatedUserToken(CreateUserResponse authenticatedUserToken) {
        this.authenticatedUserToken = authenticatedUserToken;
    }
}
