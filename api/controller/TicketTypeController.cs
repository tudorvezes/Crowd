using api.data;
using api.repository;
using Microsoft.AspNetCore.Mvc;

namespace api.controller;

[Route("api/ticket-type")]
[ApiController]
public class TicketTypeController : ControllerBase
{
	private readonly ITicketTypeRepository _ticketTypeRepo;

	public TicketTypeController(ITicketTypeRepository ticketTypeRepository)
	{
		_ticketTypeRepo = ticketTypeRepository;
	}
	
	
}