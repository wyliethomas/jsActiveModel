Fr.Controller.create('offline','layouts/application', function(){

  return{
    onInit : function(done){
      done();
    },
    render : function(done){
      done({body: 'main/index', header: 'layouts/header', footer: 'layouts/footer'});
    },
    afterRender : function(done){
    },
    cleanUp : function(){
    }
  };

});
