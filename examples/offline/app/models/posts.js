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
