Ractive.DEBUG = false;
var theme_name = _config['theme'];
$("#header-js").prepend('<script src="themes/' + theme_name + '/config.js"></script>');
$("#header-js").prepend('<script src="themes/' + theme_name + '/theme.js"></script>');
function index(page){
	var page = parseInt(page) || 1; window._G = window._G || {post: {}, postList: {}};
    $('title').html(_config['blog_name']);
	loadOptions();
    if(_G.postList[page] != undefined){$('#container').html(_G.postList[page]);return;}
    $.ajax({
        url:"https://api.github.com/repos/"+_config['owner']+"/"+_config['repo']+"/issues",
        data:{
            filter       : 'created',
            page         : page,
            access_token : _config['access_token'],
            per_page     : _config['per_page']
        },
        beforeSend:function(){
          $('#container').html(loading_animation);
		  $('#comment').remove();
        },
        success:function(data, textStatus, jqXHR){
            var link = jqXHR.getResponseHeader("Link") || "";
            var next = false;
            var prev = false;
            if(link.indexOf('rel="next"') > 0){
              next = true;
            }
            if(link.indexOf('rel="prev"') > 0){
              prev = true;
            }
            var ractive = new Ractive({
                template : '#listTpl',
                data     : {
                    posts : data,
                    next  : next,
                    prev  : prev,
                    page  : page
                }
            });
            window._G.postList[page] = ractive.toHTML();
            $('#container').html(window._G.postList[page]);
			afterLoading();
            for(i in data){
              var ractive = new Ractive({
                  template : '#detailTpl',
                  data     : {post: data[i]}
              });
              window._G.post[data[i].number] = {};
              window._G.post[data[i].number].body = ractive.toHTML();
              
              var title = data[i].title + " | " + _config['blog_name'];
              window._G.post[data[i].number].title = title;
            }
        }
    });
}
function detail(id){
    if(!window._G){
      window._G = {post: {}, postList: {}};
      window._G.post[id] = {};  
    }
    
    if(_G.post[id].body != undefined){
      $('#container').html(_G.post[id].body);
      $('title').html(_G.post[id].title);
      location.reload();
	  afterPost();
      return;
    }
    $.ajax({
        url:"https://api.github.com/repos/"+_config['owner']+"/"+_config['repo']+"/issues/" + id,
        data:{
            access_token:_config['access_token']
        },
        beforeSend:function(){
            beforePost();
        },
        success:function(data){
            var ractive = new Ractive({
                 el: "#container",
                 template: '#detailTpl',
                 data: {post: data}
            });

            $('title').html(data.title + " | " + _config['blog_name']);
			loadOptions();
        }
    });  

}
var gitalk = new Gitalk({
  clientID: _config['clientID'],
  clientSecret: _config['clientSecret'],
  repo: _config['gitalk_repo'],
  owner: _config['owner'],
  admin: [_config['owner']],
  id: location.href,
  distractionFreeMode: false
})
gitalk.render('gitalk-container');
var helpers = Ractive.defaults.data;
helpers.markdown2HTML = function(content){
    return marked(content,{
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false
});
}
helpers.formatTime = function(time){
    return time.substr(0,10);
}
var routes = {
    '/': index,
    'p:page': index,
    'post/:postId': detail
};
var router = Router(routes);
router.init('/');
console.log("%c 📝 Noter %c by Eltrac ","color: #fff; margin: 1em 0; padding: 5px 0; background: #4D90FE","margin: 1em 0; padding: 5px 0; background: #efefef;");