package org.blanc.whiteboard;

import org.blanc.whiteboard.exception.AccessDeniedExceptionMapper;
import org.blanc.whiteboard.filter.jersey.JerseyCrossOriginResourceSharingFilter;
import org.blanc.whiteboard.resource.GenericExceptionMapper;
import org.glassfish.jersey.jackson.JacksonFeature;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.server.spring.scope.RequestContextFilter;
import org.springframework.context.ApplicationContext;
import org.springframework.web.context.ContextLoader;

import javax.ws.rs.container.ContainerResponseFilter;


public class RestResourceApplication extends ResourceConfig {

    public RestResourceApplication() {

        packages("org.blanc.whiteboard.resource", "org.blanc.whiteboard.user.resource",
        "org.blanc.whiteboard.sample");

        register(RequestContextFilter.class);

        ApplicationContext rootCtx = ContextLoader.getCurrentWebApplicationContext();
        ContainerResponseFilter filter = rootCtx.getBean(JerseyCrossOriginResourceSharingFilter.class);
        register(filter);

        register(GenericExceptionMapper.class);
        register(AccessDeniedExceptionMapper.class);

        register(JacksonFeature.class);

    }
}