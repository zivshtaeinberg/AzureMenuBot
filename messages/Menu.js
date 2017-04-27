var DocumentDBClient = require('documentdb').DocumentClient;
var async = require('async');

 function Menu(MenuItem) {
   this.menuItem = MenuItem;
 }

 Menu.prototype = {
     getMenuItems: function () {
         var self = this;

         var querySpec = {
             query: 'SELECT * FROM root r'
         };

         self.menuItem.find(querySpec, function (err, items) {
             if (err) {
                 throw (err);
             }

             return items;
         });
     },

     addMenuItem: function (item) {
         var self = this;

         self.menuItem.addItem(item, function (err) {
             if (err) {
                 throw (err);
             }
         });
     }
 };

 module.exports = Menu;