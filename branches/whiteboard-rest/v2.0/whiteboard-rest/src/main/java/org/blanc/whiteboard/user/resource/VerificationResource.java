package org.blanc.whiteboard.user.resource;

import org.blanc.whiteboard.user.VerificationTokenService;
import org.blanc.whiteboard.user.api.EmailVerificationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.security.PermitAll;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;


@Path("/v1.0/verify")
@Component
@Produces({MediaType.APPLICATION_JSON})
@Consumes({MediaType.APPLICATION_JSON})
public class VerificationResource  {

    @Autowired
    protected VerificationTokenService verificationTokenService;

    @PermitAll
    @Path("tokens/{token}")
    @POST
    public Response verifyToken(@PathParam("token") String token) {
        verificationTokenService.verify(token);
        return Response.ok().build();
    }

    @PermitAll
    @Path("tokens")
    @POST
    public Response sendEmailToken(EmailVerificationRequest request) {
        verificationTokenService.generateEmailVerificationToken(request.getEmailAddress());
        return Response.ok().build();
    }
}
