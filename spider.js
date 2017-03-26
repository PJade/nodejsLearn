"use strict"
//调用模块

var http = require('http');
var fs = require('fs'); 
var cheerio = require('cheerio');
var iconv = require('iconv-lite'); 
//对不同的编码格式进行转换，注意编码格式要看http传输时的头的说明，而不是HTML文件里的格式。
//var url = require('url')
var url = 'http://baike.baidu.com/item/%E8%B6%85%E5%9C%B0%E5%B9%B3%E7%BA%BF%E9%9B%B7%E8%BE%BE';



//下载HTML数据函数，同时把HTML传递给callback回调函数处理HTML
function download(url, callback) {
    http.get(url, function(res) 
    {
        var data = "";
        var chunks = [], size = 0;
        //对res发出的data事件添加事件处理函数，使用chunk存储接收的数据
        res.on("data" , function(chunk)
        { 
            chunks.push(chunk); 
            size += chunk.length; 
        }); 
        // 在传输完毕时进行解码
        res.on("end" , function()
        { 
            var buffer = Buffer.concat(chunks, size); 
            //使用iconv对gbk进行解码，
            var html = iconv.decode(Buffer.concat(chunks), 'utf-8');
            //同时使用download接收的函数处理刚才接收的数据。
            callback(html);
        });
        
    }).on("error", function() {
    callback(null);
  });
}

//调用刚才的函数，使用匿名函数处理HTML
download(url, function(data){
    var news = [];
    if(data){
        console.log(data);
        //cheerio.load把HTML解析成DOM对象
        var $ = cheerio.load(data);
        $('.Q-tpWrap>div.text>em>a').each(function(index, item){
            console.log(index),
            console.log($(this).text());

        });
        console.log(news);
    }
    else console.log('error');
})

download(url, function(h){
    //console.log(h);
    fs.writeFile('index.html', h, function(err){return;});
})

//建立之前下载的文件的服务器
var opt = {encoding:'utf-8', flag:'r'};
fs.readFile('index.html', opt, function(err, data){
    console.log(data);
    http.createServer(function(req, res){
        res.writeHead(200);
        res.end(data);
    }).listen(8080);
})

console.log('finish');




