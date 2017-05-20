# tfs-ticketservice-ref

This is a sample extension for TFS 2017 (on-premise) made for the sake of learning how it can be done.

Assume that there is an external user support service, and we want to create a work item in TFS with the data from the user support ticket (UST).

When one starts the title of the new work item in TFS with the ticket number (ex, 'UST245687 '), the extenstion will query the ticket service and prefill the title and the description of the work item with the ticket information. The extension will also add the hyperlink from the work item to the ticket

1. TFS 2017.1 http://localhost:8080/tfs
2. npm i -g tfx-cli
3. Ticket service http://localhost:8080/isv/ticketservice/api/

