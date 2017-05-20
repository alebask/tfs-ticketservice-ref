import * as VSSService from "VSS/Service";
import * as WitServices from "TFS/WorkItemTracking/Services";
import * as ExtensionContracts from "TFS/WorkItemTracking/ExtensionContracts";
import * as WitContract from "TFS/WorkItemTracking/Contracts";
import * as TicketService from "./TicketService";

export interface ITicketMapperContext {
    TfsTag: string;
    SyncRegexStr: string;
    TfsFormService: WitServices.IWorkItemFormService;
    TicketService: TicketService.ITicketService
}

export class TicketMapper {
   
    private _updateTicketOnSave = false;

    private _context: ITicketMapperContext;

    public get Context(): ITicketMapperContext {
        return this._context;
    }

    constructor(settings: ITicketMapperContext) {
        this._context = settings;
    }

    public setUpdateTicketOnSave(value: boolean) :void {
        this._updateTicketOnSave = value;
    }
    public getUpdateTicketOnSave(): boolean {
        return this._updateTicketOnSave;
    }

    public trackFieldChange(changedFields: { [key: string]: any }): void {
        let title = changedFields["System.Title"] as string;
        if (title != undefined) {
            let matches;
            let regexp = new RegExp("^" + this._context.SyncRegexStr + "$", "i");
            if ((matches = regexp.exec(title)) != null) {
                let ticketId = +(matches[2]);
                this._context.TicketService.retrieveTicket(ticketId).then((ticket) => {
                    this.updateTfsForm(ticket);
                    this.setUpdateTicketOnSave(true);
                });
            }
        }
    }
    public trackSave(workItemId: number): void {
        if (this.getUpdateTicketOnSave()) {
            (this._context.TfsFormService.getFieldValue("System.Title")).then((title: string) => {
                let matches;
                let regexp = new RegExp("^" + this._context.SyncRegexStr, "i");
                if ((matches = regexp.exec(title)) != null) {
                    let ticketId = +(matches[2]);
                    this._context.TicketService.retrieveTicket(ticketId).then((ticket) => {
                        let tfsIdTag = this._context.TfsTag + workItemId;
                        if (ticket.Title.indexOf(tfsIdTag) == -1) {
                            var update = new TicketService.Ticket(ticketId);
                            update.Title = ticket.Title + " " + tfsIdTag;
                            this._context.TicketService.updateTicket(update).then((t) => {
                                this.setUpdateTicketOnSave(false);
                            });                            
                        }
                    });
                }
            });
        }
    }

    public updateTfsForm(ticket: TicketService.Ticket): void {

        let formService = this._context.TfsFormService;

        //update title
        let title = "UST" + ticket.Id + " " + ticket.Title;
        formService.setFieldValue("System.Title", title);

        //update description
        (formService.getFieldValue("System.Description")).then((description) => {
            if (ticket.Description && description == "") {
                formService.setFieldValue("System.Description", ticket.Description);
            }
        });

        //set tag
        (formService.getFieldValue("System.Tags")).then((tags: string) => {
            if (ticket.ServiceType) {
                if (tags == "") {
                    formService.setFieldValue("System.Tags", ticket.ServiceType);
                }
                else if (tags.indexOf(ticket.ServiceType) == -1) {
                    formService.setFieldValue("System.Tags", [tags, ticket.ServiceType].join(";"));
                }
            }
        });

        //add hyperlink
        (formService.getWorkItemRelations()).then((relations) => {
            let existingLink = relations.filter((r) => {
                return (r.url.toLowerCase() == ticket.Url.toLowerCase());
            });
            if (existingLink.length == 0) {
                var newLink = {
                    rel: "Hyperlink",
                    title: "link to ticket item N " + ticket.Id,
                    url: ticket.Url
                };
                formService.addWorkItemRelations([<WitContract.WorkItemRelation>newLink]);
            }
        });
    }
}