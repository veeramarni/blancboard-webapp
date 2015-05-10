package org.blanc.whiteboard.user.exception;

import org.blanc.whiteboard.exception.BaseWebApplicationException;


public class AuthenticationException extends BaseWebApplicationException {

	private static final long serialVersionUID = 1L;
    public AuthenticationException() {
        super(401, "Authentication Error", "Authentication Error. The username or password were incorrect");
    }
}