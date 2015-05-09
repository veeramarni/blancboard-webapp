package org.blanc.whiteboard.user.exception;

import org.blanc.whiteboard.exception.BaseWebApplicationException;


public class TokenNotFoundException extends BaseWebApplicationException {

	private static final long serialVersionUID = 1L;
    public TokenNotFoundException() {
        super(404, "Token Not Found", "No token could be found for that Id");
    }
}
