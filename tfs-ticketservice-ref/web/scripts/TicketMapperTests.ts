import * as WitServices from "TFS/WorkItemTracking/Services";
import * as ExtensionContracts from "TFS/WorkItemTracking/ExtensionContracts";
import * as WitContract from "TFS/WorkItemTracking/Contracts";
import * as TM from "./TicketMapper";
import * as TS from "./TicketService";
import { Config } from "./Config";


describe("TicketMapper", () => {

    let _mapper: TM.TicketMapper;
    
    beforeEach((done) => {     
                
       
                
        let context = <TM.ITicketMapperContext> {
            SyncRegexStr: Config.SyncRegexStr,
            TfsTag: Config.TfsTag,
            TfsFormService: jasmine.createSpyObj("formService", ["getFieldValue", "setFieldValue", "getWorkItemRelations","addWorkItemRelations"]),
            TicketService: new TS.TicketService(Config.TicketServiceApiUrl)
        };
                        
        _mapper = new TM.TicketMapper(context);

        spyOn(_mapper, "updateTfsForm").and.callFake((t: TS.Ticket) => { });
        spyOn(_mapper.Context.TicketService, "retrieveTicket").and.callFake((id: number): Q.Promise<TS.Ticket> => {

            let ticket = new TS.Ticket(id);
            ticket.Description = "This is a test description of a ticket";
            ticket.Title = "Some test title of a ticket";
            ticket.ServiceType = "Change Request";
            ticket.Url = Config.TicketServiceApiUrl + "View/" + ticket.Id;

            return Q(ticket);
        });
        spyOn(_mapper.Context.TicketService, "updateTicket").and.callFake((ticket: TS.Ticket): Q.Promise<TS.Ticket> => {
                return Q(ticket);
            });
                
        done();    
    });

    afterEach((done) => {
        _mapper = null;
        done();
    });

    it("trackFieldChange() calls updateTfsForm() when Title conforms to regex: " + Config.SyncRegexStr, (done) => {   

        let id = 12345;
        let changedFields = { "System.Title": "UST" + id + " "};
       
        _mapper.trackFieldChange(changedFields);

        Q.all([]).then(() => {
            expect(_mapper.Context.TicketService.retrieveTicket).toHaveBeenCalledWith(id);            
            expect(_mapper.updateTfsForm).toHaveBeenCalled();
            expect(_mapper.getUpdateTicketOnSave()).toBe(true);
            done();
        });
        
    });

    it("trackFieldChange() doesn't call updateTfsForm() when Title doesn't begin with UST number", (done) => {
        
        let changedFields = { "System.Title": "Simple text title " };     

        _mapper.trackFieldChange(changedFields);
        
        Q.all([]).then(() => {

            expect(_mapper.Context.TicketService.retrieveTicket).not.toHaveBeenCalled();
            expect(_mapper.updateTfsForm).not.toHaveBeenCalled();
            expect(_mapper.getUpdateTicketOnSave()).toBe(false);
            done();
        });

    });

    it("trackFieldChange() doesn't call updateTfsForm() when Title haven't changed", (done) => {
        
        let changedFields = { "System.Description": "some description" };

        _mapper.trackFieldChange(changedFields);

        Q.all([]).then(() => {

            expect(_mapper.Context.TicketService.retrieveTicket).not.toHaveBeenCalled();
            expect(_mapper.updateTfsForm).not.toHaveBeenCalled();
            expect(_mapper.getUpdateTicketOnSave()).toBe(false);
            done();
        });

    });

    it("trackSave() calls TicketSerbice.updateTicket with @tfs tag when Title begins with UST number", (done) => {

        let ticketId = 123456;
        let workItemId = 456;

        (<jasmine.Spy>_mapper.Context.TfsFormService.getFieldValue).and.returnValue(Q("UST" + ticketId + " some test title"));
        
        _mapper.setUpdateTicketOnSave(true);
        _mapper.trackSave(workItemId);

        Q.all([]).then(() => {

            expect(_mapper.Context.TicketService.retrieveTicket).toHaveBeenCalledWith(ticketId);
            expect(_mapper.Context.TicketService.updateTicket).toHaveBeenCalled();
            expect(_mapper.getUpdateTicketOnSave()).toBe(false);


            var tfsIdTag = Config.TfsTag + workItemId;
            var updateTicketSpy = <jasmine.Spy>_mapper.Context.TicketService.updateTicket;
            var ticket = <TS.Ticket>((updateTicketSpy).calls.mostRecent().args[0]);

            expect(ticket.Id).toBe(ticketId);
            expect(ticket.Title.indexOf(tfsIdTag)).toBeGreaterThan(-1);
            expect(ticket.ServiceType).not.toBeDefined();
            expect(ticket.Url).not.toBeDefined();

            done();
        });

    });

    it("trackSave() doesn't call TicketService.updateTicket() if Title doesn't begin with UST number", (done) => {

        let ticketId = 123456;
        let workItemId = 456;

        (<jasmine.Spy>_mapper.Context.TfsFormService.getFieldValue).and.returnValue(Q("some ordinary title "));

        _mapper.setUpdateTicketOnSave(true);
        _mapper.trackSave(workItemId);

        Q.all([]).then(() => {

            expect(_mapper.Context.TicketService.retrieveTicket).not.toHaveBeenCalled();
            expect(_mapper.Context.TicketService.updateTicket).not.toHaveBeenCalled();
           
            done();
        });

    });

    it("updateTfsForm() updates empty work item from ticket service", (done) => {

        let ticket = new TS.Ticket(12345);
        ticket.Title = "some test title";
        ticket.Description = "test description";
        ticket.ServiceType = "Change Request";
        ticket.Url = "https://test-url.com";

        let tfs = _mapper.Context.TfsFormService;

        (<jasmine.Spy>_mapper.updateTfsForm).and.callThrough();
        (<jasmine.Spy>tfs.getFieldValue).and.returnValue(Q(""));                
        (<jasmine.Spy>tfs.setFieldValue).and.returnValue(true);
        (<jasmine.Spy>tfs.getWorkItemRelations).and.returnValue(Q(new Array<WitContract.WorkItemRelation>()));

        _mapper.updateTfsForm(ticket);

        Q.all([]).then(() => {
                        
            expect(tfs.setFieldValue).toHaveBeenCalledWith("System.Title", "UST" + ticket.Id + " " + ticket.Title);
            expect(tfs.setFieldValue).toHaveBeenCalledWith("System.Description", ticket.Description);
            expect(tfs.setFieldValue).toHaveBeenCalledWith("System.Tags", ticket.ServiceType);
            expect(tfs.addWorkItemRelations).toHaveBeenCalledWith([{
                rel: "Hyperlink",
                title: "link to ticket item N " + ticket.Id,
                url: ticket.Url
            }]);

            done();
        });
    });

    it("updateTfsForm() not updates filled-in field", (done) => {

        let ticket = new TS.Ticket(12345);
        ticket.Title = "some test title";
        ticket.Description = "test description";
        ticket.ServiceType = "Change Request";
        ticket.Url = "https://test-url.com";

        let relation = { rel: "Hyperlink", title: "link to ticket item N " + ticket.Id, url: ticket.Url };

        let tfs = _mapper.Context.TfsFormService;

        (<jasmine.Spy>_mapper.updateTfsForm).and.callThrough();
        (<jasmine.Spy>tfs.getFieldValue).and.returnValue(Q("some non empty value"));
        (<jasmine.Spy>tfs.setFieldValue).and.returnValue(true);
        (<jasmine.Spy>tfs.getWorkItemRelations).and.returnValue(Q([relation]));

        _mapper.updateTfsForm(ticket);

        Q.all([]).then(() => {
                       
            expect(tfs.setFieldValue).not.toHaveBeenCalledWith("System.Description", ticket.Description);
            expect(tfs.setFieldValue).not.toHaveBeenCalledWith("System.Tags", ticket.ServiceType);
            expect(tfs.addWorkItemRelations).not.toHaveBeenCalledWith([relation]);

            done();
        });
    });
});
