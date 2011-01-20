(function($){
    var methods = {
      init : function(options){
        var DBTABLE = $(this)[0].DBTABLE;
        var DBCOLUMNS = $(this)[0].DBCOLUMNS;
        methods.db_setup(DBTABLE, DBCOLUMNS);
      },//end init



      db_open : function(){
        //these vars should have been set on some global var
        //var DATABASE = '';
        //var DBVERSION = '';
        //var DBDESCRIPTION = '';
        //var DBSIZE = '';
        if(window.openDatabase){
          db = openDatabase(DATABASE, DBVERSION, DBDESCRIPTION, DBSIZE);
          return true;
        }else{
          return false;
        }
      },//end db_open

      

      db_setup : function(DBTABLE, DBCOLUMNS){
        if(methods.db_open()){
          DBCOLUMNS = DBCOLUMNS + ', local_storage_id'; 
          db.transaction(function (tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS ' + DBTABLE + ' (' + DBCOLUMNS + ')');
            tx.executeSql('CREATE TABLE IF NOT EXISTS ' + DBTABLE + '_AUDIT (' + DBCOLUMNS + ', api_url)');
          });
        }else{
          //methods.get_records( url );
        }
      },//end db_setup



      find : function( id, url, findClientHandle){
        if(window.openDatabase){
          var DBTABLE = $(this)[0].DBTABLE;
          //get results localy
          db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM '+ DBTABLE +' WHERE local_storage_id = ?', [id], function (tx, results) {
              data = [];
              var len = results.rows.length, i;
              for (i = 0; i < len; i++) {
                data.push({DBTABLE:{'name': results.rows.item(i).name}}); 
                //alert(results.rows.item(i).name);
              }
              findClientHandle(data);
            });
          });
        }else{
          //get results from api
          function returnHandler(data){
            findClientHandle(data);
          }
          $.getJSON(url + '?auth_token=' + AUTH_TOKEN +'&callback=?', returnHandler);
        }
      },//end find



      all : function( url, cb ){ 
        if(window.openDatabase){
          var DBTABLE = $(this)[0].DBTABLE;
          //get results localy
          db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM '+ DBTABLE, [], function (tx, results) {
              data = [];
              var len = results.rows.length, i;
              for (i = 0; i < len; i++) {
                for(var column in results.rows.item(i)){
                  debugger
                }
                data.push({DBTABLE:{'name': results.rows.item(i).name, 'local_storage_id': results.rows.item(i).local_storage_id}}); 
                //alert(results.rows.item(i).name);
              }
              cb(data);
            });
          });
        }else{
          //get results from api
          function returnHandler(data){
            cb(data);
          }
          $.getJSON(url + '?auth_token=' + AUTH_TOKEN +'&callback=?', returnHandler);
        }
      },//end get



      create : function( data, url, cb ){
        var DBTABLE = $(this)[0].DBTABLE;
        var IS_SYNCABLE = $(this)[0].IS_SYNCABLE;

        methods.auto_increment_key(DBTABLE); //sets the last_local_id
        db.transaction(postit, error, success);

        //openDatabase callbacks
        function postit(jdb){
          var keys = ''; //add local_id as a default to all tables
          var values = '';

          for(var item in data) {
              keys = keys + "'" + item + "', ";
              values = values + "'" + data[item] + "', ";
          }

          keys = 'id, ' + keys + ' local_storage_id';
          values = 'null, ' + values + ' ' + last_local_id;
          alert(values);

          jdb.executeSql('INSERT INTO ' + DBTABLE + '  (' + keys + ') VALUES (' + values + ')');
          jdb.executeSql('INSERT INTO ' + DBTABLE + '_AUDIT  (' + keys + ', api_url) VALUES (' + values + ', "' + url + '")');
        }
        function error(jdb, err){
          alert("CREATE: Error processing SQL: " + jdb.message);
        }
        function success(jdb){
          //if this model is_syncable and API is online, trigger sync method
          if(IS_SYNCABLE){
            methods.sync(DBTABLE, url, function(syncHandle){
              alert(syncHandle);
              cb(syncHandle);
            });
          }
          //should catch an else here if model is not syncable... not sure yet
        }  

      },//end create



      update : function(id, url, updateHandle){
        var DBTABLE = $(this)[0].DBTABLE;
        var IS_SYNCABLE = $(this)[0].IS_SYNCABLE;

        db.transaction(postit, error, success);

        //openDatabase callbacks
        function postit(jdb){
          var sql_data = '';
          for(var item in data) {
              sql_data = sql_data + item + "='" + data[item] + "', ";
          }

          //jdb.executeSql('UPDATE ' + DBTABLE + ' SET ' + sql_data + ' WHERE local_storage_id=' + id+ ');
          jdb.executeSql('INSERT INTO ' + DBTABLE + '_AUDIT  (' + keys + ', api_url) VALUES (' + values + ', "' + url + '")');

        }
        function error(jdb, err){
          alert("UPDATE: Error processing SQL: " + jdb.message);
        }
        function success(jdb){
          //if this model is_syncable and API is online, trigger sync method
          if(IS_SYNCABLE){
            methods.sync(DBTABLE, url, function(syncHandle){
              alert(syncHandle);
              cb(syncHandle);
            });
          }
          //should catch an else here if model is not syncable... not sure yet
        }  
      },//end update


      sync : function(DBTABLE, url, syncHandle){
        //need to get the lastID at some point
        //methods.find_last_id(DBTABLE, function(lastIdHandle){
        //});
        //loop through the audit table and send one post at a time
        function dataHandler(transaction, results)
        {
          // Handle the results
          for (var i=0; i<results.rows.length; i++) {
            // Each row is a standard JavaScript array indexed by
            // column names.
            var row = results.rows.item(i);
            methods.send_request(DBTABLE, row, function(sendRequestHandle){
              syncHandle(sendRequestHandle);
            });
          }
        }
        function errorHandler(transaction, error)
        {
            // error.message is a human-readable string.
            // error.code is a numeric error code
            alert('Oops.  Error was '+error.message+' (Code '+error.code+')');
         
            // Handle errors here
            var we_think_this_error_is_fatal = true;
            if (we_think_this_error_is_fatal) return true;
            return false;
        }
        db.transaction(
          function (transaction) {
            transaction.executeSql("SELECT * FROM " + DBTABLE + "_AUDIT;",
                [], // array of values for the ? placeholders
                dataHandler, errorHandler);
          }
        );
      },//end sync



      auto_increment_key : function(DBTABLE){
        function dataHandler(transaction, results)
        {
            // Handle the results
            for (var i=0; i<results.rows.length; i++) {
                // Each row is a standard JavaScript array indexed by
                // column names.
                var row = results.rows.item(i);
                last_local_id = row['last_local_id'] + 1;
            }
        }
        function errorHandler(transaction, error)
        {
            // error.message is a human-readable string.
            // error.code is a numeric error code
            alert('Oops.  Error was '+error.message+' (Code '+error.code+')');
         
            // Handle errors here
            var we_think_this_error_is_fatal = true;
            if (we_think_this_error_is_fatal) return true;
            return false;
        }
        db.transaction(
            function (transaction) {
                transaction.executeSql("SELECT MAX(local_storage_id) AS last_local_id FROM " + DBTABLE,
                    [], // array of values for the ? placeholders
                    dataHandler, errorHandler);
            }
        );

      },//end auto_increment_key




      find_last_id : function(DBTABLE){
        //get the last id so it can be used as a marker during sync
        function dataHandler(transaction, results)
        {
            // Handle the results
            for (var i=0; i<results.rows.length; i++) {
                // Each row is a standard JavaScript array indexed by
                // column names.
                var row = results.rows.item(i);
                last_id = row['last_id'] + 1;
            }
        }
        function errorHandler(transaction, error)
        {
            // error.message is a human-readable string.
            // error.code is a numeric error code
            alert('Oops.  Error was '+error.message+' (Code '+error.code+')');
         
            // Handle errors here
            var we_think_this_error_is_fatal = true;
            if (we_think_this_error_is_fatal) return true;
            return false;
        }
        db.transaction(
            function (transaction) {
                transaction.executeSql("SELECT MAX(id) AS last_id FROM " + DBTABLE,
                    [], // array of values for the ? placeholders
                    dataHandler, errorHandler);
            }
        );

      },//end find_last_id




      destroy : function(options){
      },//end destroy


      
      send_request : function(DBTABLE, row, sendRequestHandle){
        var params = '';
        for(var item in row) {
          //need to filter out local_storage_id
          if(item != 'local_storage_id' || 'api_url'){
            //this part is a bit hardwired for rails params
            //for example post[subject]
            //just so i can use params[:post] in my rails app
            params = params + '&' + DBTABLE + '[' + item + ']=' + row[item];
          }
        }
        var data = encodeURI(params);
        debugger

        $.ajax({
            url : url + '?auth_token=' + AUTH_TOKEN + data,
            method : 'GET',
            dataType : 'jsonp',
            error: function(request, textStatus, error) {
                if (request.status == 401) {
                    ShowLoginUI(function() {
                        data = self.Get(url);
                    });
                }
                alert('error: ' + request);
            },
            success: function(res){
              //some error catch here if the data from 

              //if there is local storage then save it, if not just return the response
              if(window.openDatabase){
                methods.merge(res, row['local_storage_id'], function(mergeHandle){
                  sendRequestHandle(mergeHandle);
                });
                //methods.merge(res, row['local_storage_id']);
              }else{
                alert('return stuff here: ' + res);
                sendRequestHandle(res);
              }
            }
          });
      },//end send_request




      merge : function(res, local_storage_id, mergeHandle){
        //update the table with the ID from the server
        //update the database
        db.transaction(
          function (transaction) {
            transaction.executeSql("UPDATE " + DBTABLE + " set id=? where local_storage_id=?;", [ res.a.id, local_storage_id ]); // array of values for the ? placeholders
          }
        );
        //purge the audit table
        methods.destroy_audit(local_storage_id, function(destroyAuditHandle){
          mergeHandle(destroyAuditHandle);
        });
        //mergeHandle('got to merge');
      },//end merge




    destroy_audit : function(local_storage_id, destroyAuditHandle){
        //removes the record from the audit table only
        db.transaction(
          function (transaction) {
           transaction.executeSql("DELETE FROM " + DBTABLE + "_AUDIT where local_storage_id=?;", [ local_storage_id ]); // array of values for the ? placeholders
          }
        );
      destroyAuditHandle('all done');
    }//end destroy_audit

    };











  $.fn.jsActiveModel = function( method, options ) {
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jsActiveModel' );
    }    
  
  };
})(jQuery);
