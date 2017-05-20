namespace TfsTicketServiceRef.Models
{
    public class Ticket
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public string Title { get; set; }
        public string ServiceType { get; set; }

        public string Url { get; set; }
    }
}