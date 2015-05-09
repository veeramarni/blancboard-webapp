package org.blanc.whiteboard.oauth2;


import org.blanc.whiteboard.exception.BaseWebApplicationException;


public class AuthorizationException extends BaseWebApplicationException {


	private static final long serialVersionUID = 1L;

	public AuthorizationException(String applicationMessage) {
        super(403, "Not authorized", applicationMessage);
    }

}
