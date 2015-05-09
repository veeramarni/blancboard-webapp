package org.blanc.whiteboard.user.api;

import javax.validation.constraints.NotNull;
import javax.xml.bind.annotation.XmlRootElement;


@XmlRootElement
public class LostPasswordRequest {

    private String emailAddress;

    public LostPasswordRequest() {}

    public LostPasswordRequest(final String emailAddress) {
        this.emailAddress = emailAddress;
    }

    @NotNull
    public String getEmailAddress() {
        return emailAddress;
    }

    public void setEmailAddress(String emailAddress) {
        this.emailAddress = emailAddress;
    }
}
