var PORT = 9090;
var parseString = require('xml2js').parseString;
var https = require('https');
var http = require('http')
var qs = require('qs');
var iconv = require('iconv-lite');
var fs = require('fs');

//http和https 协议下载页面区别
//如何使用代理
//异步执行到底是怎么执行的
//爬下html中所有图片






/*
目前进度：
1. 接受提取信息
2. 爬下相关页面

接下来的工作：
构建web服务器
并实现爬取与写入的同步
*/







//接受用户消息，爬下维基页面，构建一个web服务器，
function web(con){
    var wikiUrl = 'https://zh.wikipedia.org/wiki/'+con;
    wikiUrl = encodeURI(wikiUrl);

    //使用download函数把wikiUrl下载下来，并存在index.html里面。
    download(wikiUrl, function(h){
    console.log(h);
    fs.writeFile('index.html', h, function(err){return;});
    });

    //建立之前下载的文件的服务器
    //服务器不应该在这个函数里面，而是应该放在函数外面一直运行，
    //现在的问题还有怎么nodejs中翻墙
    

};


//爬虫函数
function download(url, callback) {
    https.get(url, function(res) 
    {
        var data = "";
        var chunks = [], size = 0;
        res.on("data" , function(chunk)
        { 
            chunks.push(chunk); 
            size += chunk.length; 
        }); 
        res.on("end" , function()
        { 
            var buffer = Buffer.concat(chunks, size); 
            //使用iconv对gbk进行解码，
            var html = iconv.decode(Buffer.concat(chunks), 'utf-8');
            callback(html);
        });
        
    }).on("error", function() {
    callback(null);
  });
}


//解析收到的xml数据，返回发送的xml格式。
function trans(xml){
    var obj;
    var ori = '<xml><ToUserName><![CDATA[TOUSER]]></ToUserName>\
<FromUserName><![CDATA[FROMUSER]]></FromUserName>\
<CreateTime>1489660301</CreateTime><MsgType><![CDATA[text]]></MsgType>\
<Content><![CDATA[CONTENT]]></Content></xml>'
    parseString(xml, function(err, result){
    obj = result;
	});
    //解析出to和fromUser，用来一会返回
    var toUser = obj.xml.ToUserName[0]
    var fromUser = obj.xml.FromUserName[0]
    var content = obj.xml.Content[0]    
    web(content);
    //把原来的字符串to和from替换
    ori = ori.replace('TOUSER', fromUser);
    ori = ori.replace('FROMUSER', toUser)
//    ori = ori.replace('CONTENT', content)    
    ori = ori.replace('CONTENT', 'http://jlugame.cn:8080')

    return ori;
};


var TOKEN = 'pku';
//检查是否是微信发来的消息，并且返回字符串
function checkSignature(params, token){
	var key = [token, params.timestamp, params.nonce].sort().join('');//排序
	var sha1 = require('crypto').createHash('sha1');//哈希
	sha1.update(key);
	
	return sha1.digest('hex') == params.signature;//检验
};


//http服务器，用来接收消息
var server = http.createServer(function (request, response) {
	var query = require('url').parse(request.url).query;//使用url进行解析
	var params = qs.parse(query);

	console.log(params);
	console.log('token:', TOKEN);
    //检查是否是微信平台消息
    if (!checkSignature(params, TOKEN)){
        response.end('signature fail');
        return;
    }

    if(request.method == 'GET'){
        //如果是GET则返回echostr用于验证
        response.end(params.echostr)

    }else{
        //else是一个POST请求
        var postdata = "";
        request.addListener('data', function(postchunk){
            postdata += postchunk;
        });

        //获取的POST数据
        request.addListener("end", function(){
            console.log(postdata);
            response.end(trans(postdata));

        });
    }


});

//server.listen(PORT);
web('北京')
var opt = {encoding:'utf-8', flag:'r'};
fs.readFile('index.html', opt, function(err, data){
    console.log(data);
    http.createServer(function(req, res){
        res.writeHead(200);
        res.end(data);
    }).listen(8080);
})
console.log('server running at port:', PORT);
