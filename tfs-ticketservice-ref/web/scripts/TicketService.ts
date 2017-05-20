import * as Q from "q";

export class Ticket {
    public Id: number;
    public Description: string;
    public Title: string;
    public ServiceType: string;
    public Url: string;

    constructor(id?: number) {
        if (id) {
            this.Id = id;
        }
    }
}

export interface ITicketService {

    readonly ServiceUrl: string;
    retrieveTicket(id: number): Q.IPromise<Ticket>;
    updateTicket(t: Ticket): Q.IPromise<Ticket>;
}

export class TicketService implements ITicketService {

    private _serviceUrl;

    public get ServiceUrl(): string {
        return this._serviceUrl;
    }

    constructor(serviceUrl: string) {

        this._serviceUrl = serviceUrl;
    }

    public retrieveTicket(id: number): Q.Promise<Ticket> {

        var url = this._serviceUrl + "tickets/" + id;

        return Q($.ajax({
            url: url,
            xhrFields: { withCredentials: true },
            method: "GET",
            dataType: "json"
        })).catch((e) => {
            console.error("GET to " + url + " returned an error: " + JSON.stringify(e));
            throw e;
        });
    }

    public updateTicket(t: Ticket): Q.Promise<Ticket> {

        if (t.Id == undefined || t.Id == null) {
           return Q.reject<Ticket>(new Error("task.id cannot be null or undefined"));
        }

        var url = this._serviceUrl + "tickets/" + t.Id;

        return Q($.ajax({
            url: url,
            xhrFields: { withCredentials: true },
            method: "PUT",
            data: t, dataType: "json"
        })).catch((e) => {
            console.error("PUT to " + url + " with data " + JSON.stringify(t) + " returned an error: " + JSON.stringify(e));
            throw e;
        });
    }
}

