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
JSActiveModelSync.prototype.dbopen = function(parms){
  //these vars should have been set on some global var
  if(window.openDatabase){
    var DATABASE = parms['DATABASE'];
    var DBVERSION = parms['DBVERSION'];
    var DBDESCRIPTION = parms['DBDESCRIPTION'];
    var DBSIZE = parms['DBSIZE'];
    db = openDatabase(DATABASE, DBVERSION, DBDESCRIPTION, DBSIZE);
    return true;
  }else{
    return false;
  }
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
JSActiveModelSync.prototype.update = function(){
}
JSActiveModelSync.prototype.create = function(){
}
JSActiveModelSync.prototype.destroy = function(){
}






//klass methods
JSActiveModelSync.klass = {
  all : function(){
    JSActiveModelSync.prototype.init(this.parms); //make sure db is available and open
    DBTABLE = this.parms['DBTABLE'];
    db.transaction(function (tx) {
      tx.executeSql('SELECT * FROM ' + DBTABLE, [], successHandler, errorHandler);
    });
    successHandler = function(tx, results){
      if(results.rows.length == 0){
        console.log('got no rows');
        data = '0';
          //insert data because the table's empty
      } else {
        console.log('got some rows');
        data = [];
        var len = results.rows.length, i;
        for (i = 0; i < len; i++) {
          //data.push({DBTABLE:{'name': results.rows.item(i).name}}); 
        }
      }
    };
    errorHandler = function(tx, results){
      console.log('got an error');
    };
  },
  find : function(){
    db.transaction(function (tx) {
      tx.executeSql('SELECT * FROM '+ DBTABLE +' WHERE local_storage_id = ?', [id], function (tx, results) {
        data = [];
        var len = results.rows.length, i;
        for (i = 0; i < len; i++) {
          data.push({DBTABLE:{'name': results.rows.item(i).name}}); 
          //alert(results.rows.item(i).name);
        }
        findHandle(data);
      });
    });
  },
  where : function(){
  },
  find_by_sql : function(){
  }
}



JSActiveModel.hideKlass(JSActiveModelSync);

