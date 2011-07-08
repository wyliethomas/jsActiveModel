Fr.Controller.create('offline','main/index', function(){

  return{
    render : function(done){
      Posts.all('na', function(post_data){
        done({body: 'main/index', post_data : post_data});
      });
    },
    afterRender : function(done){
      $('.nav a').click(function(){
        Fr.offline.renderViewTo({ view: $(this).attr('href'), target: '#content', transition: 'slide-right' });
        return false;
      });

      $('.list .post a').click(function(){
        var jsam_id = $(this).attr('data-jsam-id');
        Fr.offline.renderViewTo({ view: $(this).attr('href'), target: '#content', transition: 'slide-left', args: {jsam_id: jsam_id} });
        return false;
      });
    },
    cleanUp : function(){
      $('.list .post a').unbind('click');
    }
  };
});
