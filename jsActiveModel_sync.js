

//api
var JSActiveModel = function(){
};

JSActiveModel.inheritKlass = function(k1, k2){
  k1.klass = k1["klass"] || {};
  for (var p in k2.klass) {
    k1.klass[p] = k2.klass[p];
  }
}

JSActiveModel.hideKlass = function(model){
  var wrapFunc = function(func) {
    return function() {
      return func.apply(model,arguments);
    };
  };

  for(var i in model.klass){
    model[i] = wrapFunc( model.klass[i] );
  }
}

JSActiveModel.scopeFunction = function( target, source, scope ){
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
