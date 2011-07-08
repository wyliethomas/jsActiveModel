Fr.Controller.create('offline','main/edit', function(){
  return{
    render : function(done, args){
      Posts.find('na', args.jsam_id, function(post_data){
        done({body: 'main/edit', post_data: post_data, jsam_id: args.jsam_id});
      });
    },
    afterRender : function(done){
      $('.nav a').click(function(){
        Fr.offline.renderViewTo({ view: $(this).attr('href'), target: '#content', transition: 'slide-right' });
        return false;
      });

      $('#post_form').submit(function(data){
        post_data = {};
        $('input').each(function(index, value){
          var key = $(this)[0].name;
          var val = $(this).val();
          if($(this)[0].type != 'submit'){
            post_data[key] = val;
          }
        });
        $('textarea').each(function(index, value){
          var key = $(this)[0].name;
          var val = $(this).val();
          post_data[key] = val;
        });
        id = $(this).attr('data-id');

        Posts.update('na', id ,post_data, function(update_handle){
          Fr.offline.renderViewTo({ view: 'main/index', target: '#content', transition: 'slide-right' });
        });
        return false;
      });
    },
    cleanUp : function(){
      $('#post_form').unbind('submit');
      $('.nav a').unbind('click');
    }
  };
});
