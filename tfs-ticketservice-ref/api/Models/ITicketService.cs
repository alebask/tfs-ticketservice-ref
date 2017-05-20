namespace TfsTicketServiceRef.Models
{
    public interface ITicketService
    {
        Ticket RetrieveTicket(int id);

        Ticket UpdateTicket(Ticket t);
    }
}