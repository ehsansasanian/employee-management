package com.dedalus.em.api.exceptions;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.hibernate.exception.ConstraintViolationException;

@Provider
public class ConstraintViolationExceptionHandler implements ExceptionMapper<ConstraintViolationException> {
    @Override
    public Response toResponse(ConstraintViolationException exception) {
        // TODO: This is not a good way to handle this. We should define a dedicated exception class for this.
        // Skipping it for now to keep it simple.
        return Response.status(Response.Status.BAD_REQUEST)
                .entity("Constraint violation: " + exception.getConstraintName())
                .build();
    }
}
