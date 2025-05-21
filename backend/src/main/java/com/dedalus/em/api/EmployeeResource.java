package com.dedalus.em.api;

import com.dedalus.em.api.dto.EmployeeDTO;
import com.dedalus.em.service.EmployeeService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/employees")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EmployeeResource {

    @Inject
    EmployeeService service;

    @GET
    public Response list(@QueryParam("q") String q,
                         @QueryParam("page") @DefaultValue("0") int page,
                         @QueryParam("size") @DefaultValue("20") int size) {
        List<EmployeeDTO> result;
        if (q == null || q.isBlank()) {
            result = service.findAll(page, size).stream().map(EmployeeDTO::fromEntity).toList();
        } else {
            result = service.search(q, page, size).stream().map(EmployeeDTO::fromEntity).toList();
        }
        return Response.status(Response.Status.OK)
                .entity(result)
                .build();
    }

    @POST
    public Response create(@Valid EmployeeDTO dto) {
        return Response.status(Response.Status.OK)
                .entity(EmployeeDTO.fromEntity(service.create(dto.toEntity(), dto.departmentId())))
                .build();
    }

    @GET
    @Path("{id}")
    public Response get(@PathParam("id") Long id) {
        return Response.status(Response.Status.OK)
                .entity(service.find(id))
                .build();
    }

    @PUT
    @Path("{id}")
    public Response update(@PathParam("id") Long id, @Valid EmployeeDTO dto) {
        return Response.status(Response.Status.OK)
                .entity(service.update(id, dto.toEntity(), dto.departmentId()))
                .build();
    }

    @DELETE
    @Path("{id}")
    public Response delete(@PathParam("id") Long id) {
        service.delete(id);
        return Response.status(Response.Status.NO_CONTENT).build();
    }
}
