using Newtonsoft.Json.Linq;
using System;
using System.Net.Http;
using System.Text;

namespace TfsTicketServiceRef.Models
{
    //Fake implementation fo the sake of this exercise
    public class TicketService : ITicketService
    {

        public Ticket RetrieveTicket(int id)
        {
            return new Ticket() {
                Id = id,
                Description = $"Description for the ticket #{id}",
                ServiceType = "Change Request",
                Title = $"Title for the ticket #{id}",
                Url = $"https://some-url.com/view/tickets/{id}"
            };
        }

        public Ticket UpdateTicket(Ticket update)
        {
            Ticket ticket = new Ticket();
            ticket.Id = update.Id;
            ticket.Title = update.Title ?? $"Title for the ticket #{update.Id}";
            ticket.Description = update.Description ?? $"Description for the ticket #{update.Id}";
            ticket.ServiceType = update.ServiceType ?? "Change Request";
            ticket.Url = $"https://some-url.com/view/tickets/{update.Url}";

            return ticket;
        }   
    }
}