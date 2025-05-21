package com.dedalus.em.api;

import com.dedalus.em.api.dto.DepartmentDTO;
import com.dedalus.em.service.DepartmentService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/departments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DepartmentResource {

    @Inject
    DepartmentService service;

    @GET
    public Response list(@QueryParam("page") @DefaultValue("0") int page,
                         @QueryParam("size") @DefaultValue("10") int size) {
        return Response.status(Response.Status.OK)
                .entity(service.findAll(page, size).stream().map(DepartmentDTO::fromEntity).toList())
                .build();
    }

    @POST
    public Response create(@Valid DepartmentDTO dto) {
        var created = service.create(dto.toEntity());
        return Response.status(Response.Status.CREATED)
                .entity(DepartmentDTO.fromEntity(created))
                .build();
    }

    @GET
    @Path("{id}")
    public Response get(@PathParam("id") Long id) {
        return Response.status(Response.Status.OK)
                .entity(DepartmentDTO.fromEntity(service.find(id)))
                .build();
    }

    @PUT
    @Path("{id}")
    public Response update(@PathParam("id") Long id, @Valid DepartmentDTO dto) {
        return Response.status(Response.Status.OK)
                .entity(DepartmentDTO.fromEntity(service.update(id, dto.toEntity())))
                .build();
    }

    @DELETE
    @Path("{id}")
    public Response delete(@PathParam("id") Long id) {
        service.delete(id);
        return Response.status(Response.Status.NO_CONTENT).build();
    }
}
