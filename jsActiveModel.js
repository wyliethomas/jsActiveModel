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
  all : function(url, handler){
    $.getJSON(url + '?auth_token=' + AUTH_TOKEN +'&callback=?', function(j){
      //TODO:if this is syncable then we need to sync this pull into the local DB
      handler(j);
    });
  },
  find : function(url, handler){
    $.getJSON(url + '?auth_token=' + AUTH_TOKEN +'&callback=?', function(j){
      //TODO:if this is syncable then we need to sync this pull into the local DB
      handler(j);
    });
  }
};

JSActiveModel.hideKlass(JSActiveModel);

