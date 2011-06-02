var JSActiveModelSync = function(){
};

JSActiveModelSync.prototype = new JSActiveModel();
JSActiveModelSync.prototype.constructor = JSActiveModelSync;
JSActiveModelSync.prototype.parent = JSActiveModel.prototype;

JSActiveModel.inheritKlass(JSActiveModelSync, JSActiveModel);

JSActiveModelSync.parms = {
}

/*DB methods*/
JSActiveModelSync.prototype.init = function(parms){
  JSActiveModelSync.prototype.dbsetup(parms);
}
JSActiveModelSync.prototype.dbsetup = function(parms){
  if(JSActiveModelSync.prototype.dbopen(parms)){
    var DBTABLE = parms['DBTABLE'];
    var DBCOLUMNS = parms['DBCOLUMNS'];
    DBCOLUMNS = DBCOLUMNS + ', jsam_id'; 
    db.transaction(function (tx) {
      tx.executeSql('CREATE TABLE IF NOT EXISTS ' + DBTABLE + ' (' + DBCOLUMNS + ')');
      tx.executeSql('CREATE TABLE IF NOT EXISTS ' + DBTABLE + '_AUDIT (' + DBCOLUMNS + ', api_url)');
    });
  }else{
    //methods.get_records( url );
  }
}
JSActiveModelSync.prototype.dbopen = function(parms){
  //these vars should have been set on some global var
  if(window.openDatabase){
    var DATABASE = " "+parms['DATABASE']+" ";
    var DBVERSION = parms['DBVERSION'];
    var DBDESCRIPTION = " "+parms['DBDESCRIPTION']+" ";
    var DBSIZE = parms['DBSIZE'];
    db = openDatabase(DATABASE, DBVERSION, DBDESCRIPTION, DBSIZE);
    return true;
  }else{
    return false;
  }
}


/*Housekeeping methods*/
JSActiveModelSync.prototype.if_exist = function(DBTABLE, DBCOLUMNS, data, auto_handle){
  function queryHandle(tx){
    var remote_id = data.id;
    tx.executeSql('SELECT * FROM ' + DBTABLE + ' WHERE jsam_id = ?', [remote_id], querySuccess, errorHandle );
  }
  function querySuccess(tx, results){
    if(results.rows.length == 0){
      JSActiveModelSync.prototype.sync_pull(DBTABLE, DBCOLUMNS, data)//insert this record
      auto_handle('0');
    }else{
      console.log('already here');
      //TODO:: Update method call here
      auto_handle(id);
    }
  }
  function errorHandle(err){
    console.log(err);
  }
  db.transaction(queryHandle, errorHandle);
}//end last_id
JSActiveModelSync.prototype.last_id = function(DBTABLE, auto_handle){
  function queryHandle(tx){
    tx.executeSql('SELECT MAX(id) AS last_id FROM ' + DBTABLE, [], querySuccess, errorHandle );
  }
  function querySuccess(tx, results){
    for (var i=0; i<results.rows.length; i++) {
      var row = results.rows.item(i);
      last_id = row['last_id'] + 1;
    }
    auto_handle(last_id);
  }
  function errorHandle(err){
  }
  db.transaction(queryHandle, errorHandle);
}//end last_id
JSActiveModelSync.prototype.auto_increment = function(DBTABLE, auto_handle){
  function queryHandle(tx){
    tx.executeSql('SELECT MAX(jsam_id) AS last_jsam_id FROM ' + DBTABLE, [], querySuccess, errorHandle );
  }
  function querySuccess(tx, results){
    for (var i=0; i<results.rows.length; i++) {
      var row = results.rows.item(i);
      last_jsam_id = row['last_jsam_id'] + 1;
    }
    auto_handle(last_jsam_id);
  }
  function errorHandle(err){
    handler(err);
  }
  db.transaction(queryHandle, errorHandle);
}//end auto_increment
JSActiveModelSync.prototype.audit_update = function(DBTABLE, id, keyvals){
  function queryHandle(tx){
    tx.executeSql('UPDATE ' + DBTABLE + '_AUDIT SET ' + keyvals + ' WHERE jsam_id = ' + id );
  }
  function querySuccess(tx, results){
    console.log('success');
  }
  function errorHandle(err){
    console.log('fail');
    handler(err);
  }
  db.transaction(queryHandle, errorHandle);
}//end audit_update
JSActiveModelSync.prototype.audit_delete = function(DBTABLE, id){
  function queryHandle(tx){
    tx.executeSql('DELETE FROM ' + DBTABLE + '_AUDIT WHERE jsam_id = ' + id );
  }
  function querySuccess(tx, results){
    console.log('success');
  }
  function errorHandle(err){
    console.log('fail');
    handler(err);
  }
  db.transaction(queryHandle, errorHandle);
}//end audit delete
JSActiveModelSync.prototype.sync_pull = function(DBTABLE, DBCOLUMNS, post_data){
  function insertHandle(tx, results){
    //prep post_data to have right values for right columns
    data = [];
    for(column in DBCOLUMNS){
     if(DBCOLUMNS[column] in post_data){
      data.push('"' + post_data[DBCOLUMNS[column]] + '"');
     }else{
      data.push("null");
     }
    }
    keys = DBCOLUMNS + ', jsam_id';
    values = data + ', ' + post_data.id;
    tx.executeSql('INSERT INTO ' + DBTABLE + '(' + keys + ') VALUES (' + values + ')' );
  }
  function successHandle(){
  }
  function errorHandle(err){
    handler(err);
  }
  db.transaction(insertHandle, errorHandle, successHandle);
}//end insert
JSActiveModelSync.prototype.sync_push = function(DBTABLE){
  function queryHandle(tx){
    tx.executeSql('SELECT * FROM ' + DBTABLE + '_AUDIT ', [], querySuccess, errorHandle );
  }
  function querySuccess(tx, results){
    for(i=0;i<results.rows.length;i++){
      //case for what type of a push
      switch(type){
        case 'create':
          alert('create');
          break;
        case 'update':
          alert('update');
          break;
        case 'delete':
          alert('delete');
          break;
    }
  }
  function errorHandle(err){
    handler(err);
  }
    db.transaction(queryHandle, errorHandle);
  }
}




//klass methods
JSActiveModelSync.klass = {
  all : function(url, handler){
    DBTABLE = this.parms['DBTABLE'];
    DBCOLUMNS = this.parms['DBCOLUMNS'];
    JSActiveModelSync.prototype.init(this.parms); //make sure db is available and open
    function queryHandle(tx){
      tx.executeSql('SELECT * FROM ' + DBTABLE, [], querySuccess, errorHandle );
    }
    function querySuccess(tx, results){
      if(typeof(handler) == 'function'){
        rt = []
        for(i=0;i<results.rows.length;i++){
          rows = {};
          rows = results.rows.item(i);
          rt.push(rows);
        }
        handler(rt);
      }
    }
    function errorHandle(err){
      handler(err);
    }
    if(this.parms['isSyncable']){
      db.transaction(queryHandle, errorHandle);
    }else{
      JSActiveModel.all(url, function(j){
        //NOTE: since this is unsyncable, and the views depend on jsam_id
        //we will assign the jsam_id to be the same as the id from the api
        for(i=0;i<j.length;i++){
          j[i].jsam_id = j[i].id;
        }
        handler(j);
      });
    }
  },
  find : function(url, id, handler){
    var DBTABLE = this.parms['DBTABLE'];
    function queryHandle(tx){
      tx.executeSql('SELECT * FROM ' + DBTABLE + ' WHERE jsam_id = ' + id, [], querySuccess, errorHandle );
    }
    function querySuccess(tx, results){
      if(typeof(handler) == 'function'){
        handler(results.rows.item(0));
      }
    }
    function errorHandle(err){
      handler(err);
    }
    if(this.parms['isSyncable']){
      db.transaction(queryHandle, errorHandle);
    }else{
      JSActiveModel.find(url, function(j){
        handler(j);
      });
    }
  },
  /*  Useage for find_by()
  *   [Model Name].find_by([url to api], [db column], [value], [handler])
  *   returns result from "SELECT * FROM [DBTABLE} WHERE [db column] = [value]"
  */
  find_by : function(url, key, value, handler){
    var DBTABLE = this.parms['DBTABLE'];
    function queryHandle(tx){
      tx.executeSql("SELECT * FROM " + DBTABLE + " WHERE " + key + " = ?", [value], querySuccess, errorHandle );
    }
    function querySuccess(tx, results){
      if(typeof(handler) == 'function'){
        rt = []
        for(i=0;i<results.rows.length;i++){
          rows = {};
          rows = results.rows.item(i);
          rt.push(rows);
        }
        handler(rt);
      }
    }
    function errorHandle(err){
      handler(err);
    }
    if(this.parms['isSyncable']){
      db.transaction(queryHandle, errorHandle);
    }else{
      JSActiveModel.find(url, function(j){
        handler(j);
      });
    }
  },
  update : function(url, id, post_data, handler){
    DBTABLE = this.parms['DBTABLE'];
    DBCOLUMNS = this.parms['DBCOLUMNS'];
      function insertHandle(tx, results){
        //prep post_data to have right values for right columns
        keyvals = '';
        for(column in DBCOLUMNS){
         if(DBCOLUMNS[column] in post_data){
          keyvals += DBCOLUMNS[column] + '="' + post_data[DBCOLUMNS[column]] +'", ';
         }
        }
        keyvals = keyvals.substring(0, keyvals.length-2);
        tx.executeSql('UPDATE ' + DBTABLE + ' SET ' + keyvals + ' WHERE jsam_id = ' + id );
      }
      function successHandle(){
        //audit table cleanup
        JSActiveModelSync.prototype.audit_update(DBTABLE, id, keyvals);
        //trigger sync here?
      }
      function errorHandle(err){
        handler(err);
      }
    if(this.parms['isSyncable']){
      db.transaction(insertHandle, errorHandle, successHandle);
    }else{
      JSActiveModel.prototype.update(url, function(j){
        handler(j);
      });
    }
  },//end update
  create : function(url, post_data, handler){
    DBTABLE = this.parms['DBTABLE'];
    DBCOLUMNS = this.parms['DBCOLUMNS'];
    if(this.parms['isSyncable']){
      JSActiveModelSync.prototype.auto_increment(DBTABLE, function(auto_handle){
        function insertHandle(tx, results){
          //prep post_data to have right values for right columns
          data = [];
          for(column in DBCOLUMNS){
           if(DBCOLUMNS[column] in post_data){
            data.push('"' + post_data[DBCOLUMNS[column]] + '"');
           }else{
            data.push("null");
           }
          }
          keys = DBCOLUMNS + ', jsam_id, type, url';
          values = data + ', ' + auto_handle + ', create, ' + url;
          tx.executeSql('INSERT INTO ' + DBTABLE + '(' + keys + ') VALUES (' + values + ')' );
          tx.executeSql('INSERT INTO ' + DBTABLE + '_AUDIT(' + keys + ') VALUES (' + values + ')' );
        }
        function successHandle(){
          //trigger sync here?
        }
        function errorHandle(err){
          handler(err);
        }
        db.transaction(insertHandle, errorHandle, successHandle);
      }); //auto increment before creating the record
    }else{
      JSActiveModel.prototype.create(url, function(j){
        handler(j);
      });
    }
  },//end create
  destroy : function(url, handler){
    DBTABLE = this.parms['DBTABLE'];
    DBCOLUMNS = this.parms['DBCOLUMNS'];
      function deleteHandle(tx, results){
        tx.executeSql('DELETE FROM ' + DBTABLE + ' WHERE jsam_id = ' + id );
        //tx.executeSql('INSERT INTO ' + DBTABLE + '_AUDIT(' + keys + ') VALUES (' + values + ')' );
      }
      function successHandle(){
        //audit table cleanup
        JSActiveModelSync.prototype.audit_delete(DBTABLE, id)
        //trigger sync here?
      }
      function errorHandle(err){
        handler(err);
      }
      if(this.parms['isSyncable']){
        db.transaction(deleteHandle, errorHandle, successHandle);
      }else{
        JSActiveModel.prototype.destroy(url, function(j){
          handler(j);
        });
      }
  },//end destroy
  save : function(){
  },//end save
  sync : function(url){
    //I wanted to make this a prototype method but I couldnt get parms up there. so its here for now
    var DBTABLE = this.parms['DBTABLE'];
    var DBCOLUMNS = this.parms['DBCOLUMNS'];
    JSActiveModelSync.prototype.init(this.parms); //make sure db is available and open

      JSActiveModel.req(url, function(j){
        for(i=0;i<j.length;i++){
          j[i].jsam_id = j[i].id;
          post_data = j[i];
          JSActiveModelSync.prototype.if_exist(DBTABLE, DBCOLUMNS, post_data, function(exist){
            if(exist == 0){
              //it was created
            }else{
              //it was updated
            }
          });
        }
      });

    //clear out the audit table
    JSActiveModelSync.prototype.sync_push(DBTABLE)//clean up audit table for this model

  }//end sync
}

JSActiveModel.hideKlass(JSActiveModelSync);

