package org.blanc.whiteboard.filter;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;


public class BaseCORSFilter {

    private static final Set<String> EMPTY = new HashSet<String>();

    private Set<String> parseAllowedOrigins(String allowedOriginsString) {
        if(!StringUtils.isEmpty(allowedOriginsString)) {
            return new HashSet<String>(Arrays.asList(allowedOriginsString.split(",")));
        } else {
            return EMPTY;
        }

    }

    public Set<String> getAllowedOrigins(String allowedOriginsString) {
        return parseAllowedOrigins(allowedOriginsString);
    }
}
