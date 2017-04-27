 var DocumentDBClient = require('documentdb').DocumentClient;
 var docdbUtils = require('./docdbUtils');


 function Menu(documentDBClient, databaseId, collectionId) {
   this.client = documentDBClient;
   this.databaseId = databaseId;
   this.collectionId = collectionId;

   this.database = null;
   this.collection = null;
 }

 module.exports = Menu;