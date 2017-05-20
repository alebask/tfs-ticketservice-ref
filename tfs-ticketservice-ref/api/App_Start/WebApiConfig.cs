using TfsTicketServiceRef.Models;
using Microsoft.Practices.Unity;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Web.Http;

namespace TfsTicketServiceRef
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {

            // Web API configuration and services
            config.Formatters.JsonFormatter.SupportedMediaTypes.Add(new MediaTypeHeaderValue("text/html"));
            config.Formatters.JsonFormatter.SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/octet-stream"));
            config.Formatters.JsonFormatter.SerializerSettings = new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore };
            
            //dependencies
            var container = new UnityContainer();
            container.RegisterType<ITicketService, TfsTicketServiceRef.Models.TicketService>();
            config.DependencyResolver = new UnityDependencyResolver(container);

            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "TicketServiceForTesting",
                routeTemplate: "isv/ticketservice/api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            config.Routes.MapHttpRoute(
                name: "TicketService",
                routeTemplate: "{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
        }
    }
}