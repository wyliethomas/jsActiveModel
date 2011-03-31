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
  update : function(url, handler){
    JSActiveModel.send_post(url, post_data, function(i){
      handler(i);
    });
  },
  create : function(url, handler){
    JSActiveModel.send_post(url, post_data, function(i){
      handler(i)
    });
  },
  destroy : function(url, handler){
    JSActiveModel.req(url, function(i){
      handler(i);
    });
  }
}

//prep and send data via query string for posting
JSActiveModel.send_post = function(url, post_data, handler){
  qs = '';
  for(data_item in post_data){
    qs += "&" + DBTABLE + "[" + data_item + "]=" + post_data[data_item];
  }
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url + '?auth_token=' + AUTH_TOKEN + '' + qs, true);
  xhr.onreadystatechange = onResult;
  xhr.send(null);

  function onResult(){
    if(xhr.readyState == 4){
      res = JSON.parse(xhr.responseText);
      handler(res);
    }
  }
}

//send url for find and destroy purposes
JSActiveModel.req = function(url, handler){
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url + '?auth_token=' + AUTH_TOKEN, true);
  xhr.onreadystatechange = onResult;
  xhr.send(null);

  function onResult(){
    if(xhr.readyState == 4){
      res = JSON.parse(xhr.responseText);
      handler(res);
    }
  }
}


JSActiveModel.klass = {
  all : function(url, handler){
    JSActiveModel.req(url, function(i){
      handler(i);
    });
  },
  find : function(url, handler){
    JSActiveModel.req(url, function(i){
      handler(i);
    });
  }
};

JSActiveModel.hideKlass(JSActiveModel);

