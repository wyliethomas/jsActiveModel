

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
JSActiveModelSync.prototype.dbopen = function(){
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
}
JSActiveModelSync.prototype.dbsetup = function(DBTABLE, DBCOLUMNS){
  if(methods.db_open()){
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
  },
  find : function(){
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
  DBTABLE: 'jet',
  DBCOLUMNS: []
};
Jet.prototype = new JSActiveModelSync();
Jet.prototype.constructor = Jet;
Jet.prototype.parent = JSActiveModelSync.prototype;

JSActiveModel.inheritKlass(Jet, JSActiveModelSync);
JSActiveModel.hideKlass(Jet);


jet = new JSActiveModelSync;
jet.create('foo');

Jet.all;
