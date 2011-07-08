var kubari = ['lib/Kubari/vendor/jquery-1.4.4.min',
              'lib/Kubari/vendor/jquery-ui-1.8.4.custom.min',
              'lib/Kubari/vendor/ejs', 
              'lib/Kubari/vendor/ejs_view',
              'lib/Kubari/vendor/jquery.gettext',
              'lib/Kubari/core',
              'lib/Kubari/support',
              'lib/Kubari/model',
              'lib/Kubari/view',
              'lib/Kubari/controller',
              'lib/Kubari/init'
            ];

var app = ['app/controllers/layouts/application',
           'app/controllers/layouts/header',
           'app/controllers/layouts/footer',
           'app/controllers/main/index',
           'app/controllers/main/add',
           'app/controllers/main/edit',
           'app/models/posts'
          ];

var lib = ['lib/jsActiveModel/jsActiveModel', 'lib/jsActiveModel/jsActiveModel_sync'];

var stack = function(code){
  for(var i=0 ; i < code.length ; i++){
    document.write('<script type="text/javascript" src="' + code[i] + '.js"></script>');
  }
}

stack(kubari);
stack(lib);
stack(app);


