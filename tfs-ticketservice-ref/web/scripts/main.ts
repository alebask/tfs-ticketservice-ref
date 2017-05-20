import * as WitServices from "TFS/WorkItemTracking/Services";
import * as ExtensionContracts from "TFS/WorkItemTracking/ExtensionContracts";
import { TicketMapper } from "./TicketMapper";
import { TicketService } from "./TicketService";
import { Config } from "./Config";

var ticketMapper: TicketMapper;

var attachTicketMapper = () => {
    return {
        onLoaded: (args: ExtensionContracts.IWorkItemLoadedArgs) => {
            WitServices.WorkItemFormService.getService().then((formService) => {
                ticketMapper = new TicketMapper({
                    TfsTag: Config.TfsTag,
                    SyncRegexStr: Config.SyncRegexStr,
                    TicketService: new TicketService(Config.TicketServiceApiUrl),
                    TfsFormService: formService
                });
            });
        },

        onFieldChanged: (args: ExtensionContracts.IWorkItemFieldChangedArgs) => {
            ticketMapper.trackFieldChange(args.changedFields);
        },

        onSaved: (args: ExtensionContracts.IWorkItemChangedArgs) => {
            ticketMapper.trackSave(args.id);
        }
    }
};

VSS.register(VSS.getContribution().id, attachTicketMapper);