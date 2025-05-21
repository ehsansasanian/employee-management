package com.dedalus.em.api.exceptions;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

/*
 * Would be cleaner to define a dedicated exception class for this. But keeping it simple for now.
 * TODO: Define a dedicated exception class for this.
 **/

@Provider
public class IllegalArgExceptionHandler implements ExceptionMapper<IllegalArgumentException> {
    @Override
    public Response toResponse(IllegalArgumentException exception) {
        return Response.status(Response.Status.CONFLICT)
                .entity(exception.getMessage() != null ? exception.getMessage() : "Conflict")
                .build();
    }
}
