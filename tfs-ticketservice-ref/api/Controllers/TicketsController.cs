using TfsTicketServiceRef.Models;
using System;
using System.Web.Http;

namespace TfsTicketServiceRef.Controllers
{
    public class TicketsController : ApiController
    {
        private ITicketService _ticketService;

        public TicketsController(ITicketService service)
        {
            _ticketService = service;
        }

        [HttpGet]
        public IHttpActionResult GetTicket(int id)
        {
            Ticket t = _ticketService.RetrieveTicket(id);

            return Ok(t);
        }

        [HttpPut]
        public IHttpActionResult PutTicket(int id, [FromBody]Ticket ticket)
        {
            if (ticket == null)
            {
                throw new ArgumentException("Parameter ticket cannot be null");
            }
            if (id == default(int))
            {
                throw new ArgumentException("Parameter id cannot be null");
            }

            ticket.Id = id;

            Ticket t = _ticketService.UpdateTicket(ticket);

            return Ok(t);
        }
    }
}