

//api
var JSActiveModel = function(){
};

JSActiveModel.scopeFunction = function( func, scope ){
  return function() {
    return func.apply(scope, arguments);
  };
}

JSActiveModel.scopeFunctions = function( target, source, scope ){
  for(var i in source){
    target[i] = JSActiveModel.scopeFunction( source[i], scope );
  }
}

JSActiveModel.inheritKlass = function(k1, k2){
  k1.klass = k1["klass"] || {};
  for (var p in k2.klass) {
    k1.klass[p] = k2.klass[p];
  }
  k1.parent = k1['parent'] || {};
  JSActiveModel.scopeFunctions( k1.parent, k2.klass, k1 );
}

JSActiveModel.hideKlass = function(model){
  if (model['klass']) JSActiveModel.scopeFunctions( model, model.klass, model );
}


JSActiveModel.parms = {
  foo : 'bar',
  baz : 'boo'
}

JSActiveModel.prototype = {
  update : function(){
  },
  create : function(){
  },
  destroy : function(){
  }
}

JSActiveModel.klass = {
  all : function(){
  },
  where : function(){
  },
  find : function(){
    $.getJSON(url + '?auth_token=' + AUTH_TOKEN +'&callback=?', returnHandler);
  },
  find_by_sql : function(){
  }
};

JSActiveModel.hideKlass(JSActiveModel);







//local database
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
  console.log('second: init');
  JSActiveModelSync.prototype.dbsetup(parms);
}
JSActiveModelSync.prototype.dbopen = function(parms){
  console.log('fourth: dbopen');
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
  console.log('third: dbsetup');
  if(JSActiveModelSync.prototype.dbopen(parms)){
    console.log('here');
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
  console.log('PARMS: ', this.parms);
}
JSActiveModelSync.prototype.create = function(){
}
JSActiveModelSync.prototype.destroy = function(){
}

//klass methods
JSActiveModelSync.klass = {
  all : function(){
    console.log('first: all');
    JSActiveModelSync.prototype.init(this.parms); //make sure db is available
    DBTABLE = this.parms['DBTABLE'];
    db.transaction(function (tx) {
      console.log(DBTABLE);
      tx.executeSql('SELECT * FROM ' + DBTABLE, function (tx, results) {
        console.log('here i am');
        data = [];
        var len = results.rows.length, i;
        for (i = 0; i < len; i++) {
          //data.push({DBTABLE:{'name': results.rows.item(i).name}}); 
        }
        //allHandle(data);
      });
    });
  },
  find : function(){
          //get results localy
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






//app model
var Jet = function(){};
Jet.parms = {
  DATABASE: 'teakapp',
  DBVERSION: '1',
  DBDESCRIPTION: 'testing',
  DBSIZE: 2 * 1024 * 1024,
  DBTABLE: 'b',
  DBCOLUMNS: ['id', 'name', 'email', 'address', 'city', 'state', 'zip', 'country', 'phone', 'fax', 'other_info', 'a_id', 'flag_archive', 'created_at', 'updated_at']
};
Jet.prototype = new JSActiveModelSync();
Jet.prototype.constructor = Jet;
Jet.prototype.parent = JSActiveModelSync.prototype;

JSActiveModel.inheritKlass(Jet, JSActiveModelSync);
JSActiveModel.hideKlass(Jet);


jet = new JSActiveModelSync;
jet.create('foo');

Jet.all();
