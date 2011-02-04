//api
var JSAM = function(){
};
JSAM.parms = {
  foo : 'bar',
  baz : 'boo'
}

JSAM.prototype.update = function(){
  console.log('I am a instance method of JSAM#update');
}

JSAM.klass = {};

JSAM.klass.all = function(){
  console.log('I am a class instance of JSAM#all');
}





//local database
var JSAM_SYNC = function(){
};
JSAM_SYNC.parms = {
}

JSAM_SYNC.prototype = new JSAM();
JSAM_SYNC.prototype.constructor = JSAM_SYNC;
JSAM_SYNC.prototype.parent = JSAM.prototype;


JSAM_SYNC.prototype.create = function(){
  console.log('this is JSAM_SYNC create');
}

JSAM_SYNC.isKlass = {};
JSAM_SYNC.call(JSAM_SYNC.isKlass, JSAM.klass);

JSAM_SYNC.isKlass.foo = function(){
}


function mergeKlass(c1, c2) {
  for (var p in c2) {
    try {
      if ( c2[p].constructor==Object ) {
        c1[p] = mergeKlass(c1[p], c2[p]);
      } else {
        c1[p] = c2[p];
      }
    } catch(e) {
      c1[p] = c2[p];
    }
  }
  return c1;
}

var activeModel = mergeKlass(JSAM, JSAM_SYNC);
debugger


//app model
var Jet = function(){};
Jet.prototype = new JSAM_SYNC();
Jet.prototype.contstructor = Jet;

jet = new JSAM_SYNC;
jet.create('foo');

Jet.update;
