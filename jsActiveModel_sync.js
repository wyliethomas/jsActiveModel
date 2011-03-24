var JSActiveModelSync = function(){
};

JSActiveModelSync.prototype = new JSActiveModel();
JSActiveModelSync.prototype.constructor = JSActiveModelSync;
JSActiveModelSync.prototype.parent = JSActiveModel.prototype;

JSActiveModel.inheritKlass(JSActiveModelSync, JSActiveModel);

JSActiveModelSync.parms = {
}
//proto methods
JSActiveModelSync.prototype.init = function(parms){
  JSActiveModelSync.prototype.dbsetup(parms);
}
JSActiveModelSync.prototype.dbsetup = function(parms){
  if(JSActiveModelSync.prototype.dbopen(parms)){
    var DBTABLE = parms['DBTABLE'];
    var DBCOLUMNS = parms['DBCOLUMNS'];
    DBCOLUMNS = DBCOLUMNS + ', local_storage_id'; 
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
JSActiveModelSync.prototype.auto_increment = function(DBTABLE, auto_handle){
  function queryHandle(tx){
    tx.executeSql('SELECT MAX(local_storage_id) AS last_local_id FROM ' + DBTABLE, [], querySuccess, errorHandle );
  }
  function querySuccess(tx, results){
    for (var i=0; i<results.rows.length; i++) {
      var row = results.rows.item(i);
      last_local_id = row['last_local_id'] + 1;
    }
    auto_handle(last_local_id);
  }
  function errorHandle(err){
    handler(err);
  }
  db.transaction(queryHandle, errorHandle);
}
JSActiveModelSync.prototype.audit_update = function(DBTABLE, id, keyvals){
  function queryHandle(tx){
    tx.executeSql('UPDATE ' + DBTABLE + '_AUDIT SET ' + keyvals + ' WHERE local_storage_id = ' + id );
  }
  function querySuccess(tx, results){
    console.log('success');
  }
  function errorHandle(err){
    console.log('fail');
    handler(err);
  }
  db.transaction(queryHandle, errorHandle);
}
JSActiveModelSync.prototype.audit_delete = function(DBTABLE, id){
  function queryHandle(tx){
    tx.executeSql('DELETE FROM ' + DBTABLE + '_AUDIT WHERE local_storage_id = ' + id );
  }
  function querySuccess(tx, results){
    console.log('success');
  }
  function errorHandle(err){
    console.log('fail');
    handler(err);
  }
  db.transaction(queryHandle, errorHandle);
}






//klass methods
JSActiveModelSync.klass = {
  all : function(handler){
    DBTABLE = this.parms['DBTABLE'];
    JSActiveModelSync.prototype.init(this.parms); //make sure db is available and open

    function queryHandle(tx){
      tx.executeSql('SELECT * FROM ' + DBTABLE, [], querySuccess, errorHandle );
    }

    function querySuccess(tx, results){
      if(typeof(handler) == 'function'){
        handler(results.rows);
      }
    }

    function errorHandle(err){
      handler(err);
    }

    db.transaction(queryHandle, errorHandle);
  },
  find : function(id, handler){
    function queryHandle(tx){
      tx.executeSql('SELECT * FROM ' + DBTABLE + ' WHERE local_storage_id = ' + id, [], querySuccess, errorHandle );
    }
    function querySuccess(tx, results){
      if(typeof(handler) == 'function'){
        handler(results.rows.item(0));
      }
    }
    function errorHandle(err){
      handler(err);
    }
    db.transaction(queryHandle, errorHandle);
  },
  find_by_sql : function(){
  },
  update : function(id, post_data, handler){
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
        tx.executeSql('UPDATE ' + DBTABLE + ' SET ' + keyvals + ' WHERE local_storage_id = ' + id );
      }
      function successHandle(){
        //audit table cleanup
        JSActiveModelSync.prototype.audit_update(DBTABLE, id, keyvals);
        //trigger sync here?
      }
      function errorHandle(err){
        handler(err);
      }
      db.transaction(insertHandle, errorHandle, successHandle);
  },//end update
  create : function(post_data, handler){
    DBTABLE = this.parms['DBTABLE'];
    DBCOLUMNS = this.parms['DBCOLUMNS'];
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
        keys = DBCOLUMNS + ', local_storage_id';
        values = data + ', ' + auto_handle;
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
  },//end create
  destroy : function(id){
    DBTABLE = this.parms['DBTABLE'];
    DBCOLUMNS = this.parms['DBCOLUMNS'];
      function insertHandle(tx, results){
        tx.executeSql('DELETE FROM ' + DBTABLE + ' WHERE local_storage_id = ' + id );
      }
      function successHandle(){
        //audit table cleanup
        JSActiveModelSync.prototype.audit_delete(DBTABLE, id)
        //trigger sync here?
      }
      function errorHandle(err){
        handler(err);
      }
      db.transaction(insertHandle, errorHandle, successHandle);
  },//end destroy
  save : function(){
    console.log('test');
  }//end save
}



JSActiveModel.hideKlass(JSActiveModelSync);

