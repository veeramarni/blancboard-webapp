package org.blanc.whiteboard.user.resource;

import org.blanc.whiteboard.user.VerificationTokenService;
import org.blanc.whiteboard.user.api.LostPasswordRequest;
import org.blanc.whiteboard.user.api.PasswordRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.security.PermitAll;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;


@Path("/v1.0/password")
@Component
@Produces({MediaType.APPLICATION_JSON})
@Consumes({MediaType.APPLICATION_JSON})
public class PasswordResource {

    @Autowired
    protected VerificationTokenService verificationTokenService;

    @PermitAll
    @Path("tokens")
    @POST
    public Response sendEmailToken(LostPasswordRequest request) {
        verificationTokenService.sendLostPasswordToken(request);
        return Response.ok().build();
    }

    @PermitAll
    @Path("tokens/{token}")
    @POST
    public Response resetPassword(@PathParam("token") String base64EncodedToken, PasswordRequest request) {
        verificationTokenService.resetPassword(base64EncodedToken, request);
        return Response.ok().build();
    }
}
