jsActiveModel
=========
jsActiveModel is intended to be a model layer for javascript frameworks that saves model data locally to the Web SQL database and will also sync offline data with an api.


Status
------------
** With the recent announcement of the W3C abandoning Web SQL for indexedDB, I intend to add/replace the new standard into the project as so n as it is available. For now its on. **

Some features I would like to see added: Model relationships ie. has_many and belongs_to (maybe with indexedDB it will be easier with JOIN support?). And if i could make another wish. I think it would be killer as a gem so that generating models with something like "jsam generate model posts {id, subject, content}.

I would love to hear your ideas.


About the Examples
------------
I wanted to show the model in a MVC environment so you can see how the data can be called in and rendered into a view.The framework in the examples are created using the [Kubari](https://github.com/Reisender/Kubari) framework. It's the best JS framework for my purposes (phonegap apps). I think there are alot of other ways to apply the model and as I get time to work out some examples I will add them here. NodeJS anyone?


The Basics
------------
Here is a basic model structure:
posts.js

    var Posts = function(){};

    Posts.parms = {
      isSyncable: false,
      DATABASE: 'offline_demo',
      DBVERSION: '1.0',
      DBDESCRIPTION: 'Offline Demo',
      DBSIZE: 2 * 1024 * 1024,
      DBTABLE: 'posts',
      DBCOLUMNS: ['id', 'subject', 'content']
    };

    Posts.prototype = new JSActiveModelSync();
    Posts.prototype.constructor = Posts;
    Posts.prototype.parent = JSActiveModelSync.prototype;

    JSActiveModel.inheritKlass(Posts, JSActiveModelSync);
    JSActiveModel.hideKlass(Posts);


Here is how it can be used

      Posts.all('api.myapphere.com/posts', function(post_data){
        //do stuff here
      });

You probably guessed that this will fetch all of the posts. 

It will first grab whats in the local DB, then pull new posts from the API and add that to the local DB. Then it will find any post that have not yet been pushed to the API and push them (incase they were created offline). 

If you dont want a particular model call to go to your API you can do this.

      Posts.all('', function(post_data){
        //do stuff here
      });

And it will grab only offline posts.




The Methods
------------
    Posts.all('api.myapphere.com/posts', function(post_handler){
      //do stuff here
    });


    Posts.find('api.myapphere.com/posts/7', id, function(post_handler){
      //do stuff here
    });


    Posts.find_by('api.myapphere.com/posts/find/name', name, id, function(post_handler){
      //do stuff here
    });


    Posts.find_by_sql('api.myapphere.com/posts/find', 'SELECT * FROM posts WHERE id > 10', function(post_handler){
      //do stuff here
    });


    Posts.update('api.myapphere.com/posts/update/7', id, post_data, function(post_handler){
      //do stuff here
    });


    Posts.create('api.myapphere.com/posts/create', post_data, function(post_handler){
      //do stuff here
    });




Copyright
-------
jsActiveModel is Copyright © 2011 Wylie Thomas. See License for more info.
