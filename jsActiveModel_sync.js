

//api
var JSActiveModel = function(){
};

JSActiveModel.scopeFunction = function( func, scope ){
  return function() {
    return func.apply(model,arguments);
  };
}

JSActiveModel.scopeFunctions = function( target, source, scope ){
  for(var i in source){
    target[i] = scopeFunction( source[i], scope );
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
  model.klass = model['klass'] || {};
  JSActiveModel.scopeFunctions( model, model,klass, model );
}


JSActiveModel.parms = {
  foo : 'bar',
  baz : 'boo'
}

JSActiveModel.prototype = {
  update : function(){
    return 'here i am'
  },
  creating : function(){
    return 'i am create'
  }
}

JSActiveModel.klass = {
  all : function(){
    return 'im still here';
  },
  find : function(){
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
JSActiveModelSync.prototype.create = function(){
  return "I am create on sync"
}

//klass methods
JSActiveModelSync.klass = {
  foo : function(){
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

Jet.update;
