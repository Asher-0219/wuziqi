$(function () {
    var canvas = $('canvas').get(0);
    var ctx = canvas.getContext('2d');
    var ROM = 15;
    var width = canvas.width;
    var off = width / ROM;
    var img_b = new Image();
    img_b.src = "images/baiqi.png";//白棋图片
    var img_w = new Image();
    img_w.src = "images/heiqi.png";
    var flag = true;
    var ai=false;
    var blocks = {};
    var blank={};
    for (var i=0;i<ROM;i++){
        for(var j=0;j<ROM;j++){
            blank[p2k(i,j)]=true;
        }
    }
    //小函数
    function v2k(position) {
        return position.x+"_"+position.y;
    }
    function o2k(position) {
        var arr=position.split('_');
        return {x:parseInt(arr[0]),y:parseInt(arr[1])}
    }

    function p2k(x, y) {
        return x + '_' + y;
    }

    //画棋子
    function drawchess(position, color) {
        ctx.save();
        ctx.beginPath();
        ctx.translate((position.x + 0.5) * off, (position.y + 0.5) * off)
        if (color == 'black') {
            ctx.drawImage(img_w,-16,-16);
            // ctx.shadowOffsetX = 3;
            // ctx.shadowOffsetY = 3;
            // ctx.shadowBlur = 3;
            // ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
            // ctx.fillStyle = '#000';
        }
        if (color == 'white') {
            ctx.drawImage(img_b,-16,-16);
            // ctx.shadowOffsetX = 3;
            // ctx.shadowOffsetY = 3;
            // ctx.shadowBlur = 3;
            // ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
            // ctx.fillStyle = "#fff";

        }
        // ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
        blocks[v2k(position)] = color;
        delete blank[v2k(position)];
    }
    //画棋盘
    function draw() {
        ctx.beginPath();
        for (var i = 0; i < ROM; i++) {
            ctx.moveTo(off / 2 + 0.5, off * i + off / 2 + 0.5);
            ctx.lineTo((ROM - 0.5) * off, off * i + off / 2 + 0.5)
            ctx.stroke();
            ctx.closePath();
        }
        ctx.beginPath();
        for (var i = 0; i < ROM; i++) {
            ctx.moveTo(off * i + off / 2 + 0.5, off / 2 + 0.5);
            ctx.lineTo(off * i + off / 2 + 0.5, (ROM - 0.5) * off)
            ctx.stroke();
            ctx.closePath();
        }
        drawcircle(3.5, 3.5);
        drawcircle(3.5, 11.5);
        drawcircle(7.5, 7.5);
        drawcircle(11.5, 3.5);
        drawcircle(11.5, 11.5);
    }
    //四个圆点
    function drawcircle(x, y) {
        ctx.beginPath();
        ctx.arc(x * off + 0.5, y * off + 0.5, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    function check(pos, color) {
        var hang = 1, shu = 1, zuoxie = 1, youxie = 1;
        var table = {};
        var tx = pos.x;
        var ty = pos.y;
        for (var i in blocks) {
            if (blocks[i] === color) {
                table[i] = true;
            }
        }
        //横
        while (table[p2k(tx - 1, ty)]) {
            tx--;
            hang++
        }
        ;
        tx = pos.x;
        ty = pos.y;
        while (table[p2k(tx + 1, ty)]) {
            tx++;
            hang++
        }
        ;
        tx = pos.x;
        ty = pos.y;
        //竖
        while (table[p2k(tx, ty - 1)]) {
            ty--;
            shu++
        }
        ;
        tx = pos.x;
        ty = pos.y;
        while (table[p2k(tx, ty + 1)]) {
            ty++;
            shu++
        }
        ;
        tx = pos.x;
        ty = pos.y;
        //左上
        while (table[p2k(tx + 1, ty - 1)]) {
            tx++;
            ty--;
            zuoxie++
        }
        ;
        tx = pos.x;
        ty = pos.y;
        while (table[p2k(tx - 1, ty + 1)]) {
            tx--;
            ty++;
            zuoxie++
        }
        ;
        tx = pos.x;
        ty = pos.y;
        //右上
        while (table[p2k(tx - 1, ty - 1)]) {
            tx--;
            ty--;
            youxie++
        }
        ;
        tx = pos.x;
        ty = pos.y;
        while (table[p2k(tx + 1, ty + 1)]) {
            tx++;
            ty++;
            youxie++
        };
        //返回一个最大值
        return Math.max(hang,shu,zuoxie,youxie);
    }

    function drawtext(pos,text,color) {
        ctx.save();
        ctx.font='15px 微软雅黑';
        ctx.textAlign='center';
        ctx.textBaseline='middle';
        if(color==='black'){
            ctx.fillStyle='white'
        }else if(color==='white'){
            ctx.fillStyle='black'
        }
        ctx.fillText(text,(pos.x+0.5)*off,(pos.y+0.5)*off);
        ctx.restore();
    }

    function review() {
        var i=1;
        for (var pos in blocks){
        drawtext(o2k(pos),i,blocks[pos]);
            i++;
        }
    }
    //重新开始游戏
    function restart(){
        ctx.clearRect(0,0,width,width);
        blocks={};
        flag=true;
        $('.win').css('display','none')
        $(canvas).off('click').on('click',handleclick);
        draw();
    }
    //人工ai
    function AI(){
        var pos1;
        var pos2;
        var max1=-Infinity;
        var max2=-Infinity;
        for(var i in blank){
            var score1=check(o2k(i),'black');
            var score2=check(o2k(i),'white');
            if(score1>max1){
                pos1=o2k(i);
                max1=score1;
            }
            if(score2>max2){
                pos2=o2k(i);
                max2=score2;
            }

        }
        if(max2 >= max1){
            return pos2
        }else{
            return pos1;
        }
    }
    //下棋子
    function handleclick(e) {
        var position = {
            x: Math.round((e.offsetX - off / 2) / off),
            y: Math.round((e.offsetY - off / 2) / off)
        };
        if (blocks[v2k(position)]) {
            return;
        }
        if (ai) {
            drawchess(position, 'black');
            if (check(position, 'black') >= 5) {
                $('.win').css('display','block').text('你赢了！')
                var r = confirm('是否绘制棋谱')
                if (r == true) {
                    review();
                }
                $(canvas).off('click');
                return;
            }
            drawchess(AI(), 'white');
            if (check(AI(), 'white') >= 5) {
                $('.win').css('display','block').text('回去再修炼五百年吧！')
                var r = confirm('是否绘制棋谱')
                if (r == true) {
                    review();
                }
                $(canvas).off('click');
                return;
            }
            return;
        }
        if (flag) {
            drawchess(position, 'black');
            if (check(position, 'black') >= 5) {
                $('.win').css('display','block').text('你赢了！')
                var r = confirm('是否绘制棋谱')
                if (r == true) {
                    review();
                }
                $(canvas).off('click');
                return;
            }
        } else {
            drawchess(position, 'white');
            if (check(position, 'white') >= 5) {
                $('.win').css('display','block').text('你赢了！')
                var r = confirm('是否绘制棋谱')
                if (r == true) {
                    review();
                }
                $(canvas).off('click');
                return;
            }
        }
        flag=!flag;
    }
    $(canvas).on('click',handleclick);
    draw();


    $('.star').on('click',restart);
    $('.star').on('mousedown',false);
    $('#ai').on('mousedown',false);
    $('#ai').on('click',function () {
        $(this).toggleClass('active');
        ai=true;
    })


    /////计时器

    var biao = $('.biao').get(0);
    var cxt = biao.getContext('2d');

        // ctx.clearRect(0,0,300,300);
        cxt.save();
        cxt.translate(150,150);
        cxt.save();
        for (var i=0;i<60;i++){
            cxt.beginPath();
            if (i%5==0){
                cxt.moveTo(-110,0);
            }else{
                cxt.moveTo(-120,0);
            }
            cxt.lineTo(-130,0);
            cxt.rotate(Math.PI/30);
            cxt.stroke()
            cxt.closePath()
        }
    var i=0;
    function clock() {
        // cxt.clearRect(0,0,300,300);
        i++;
        cxt.beginPath()
        cxt.arc(0,0,10,0,Math.PI*2);
        cxt.rotate(Math.PI*2/60);
        cxt.moveTo(0,-10);
        cxt.lineTo(0,-100);
        cxt.moveTo(0,10);
        cxt.lineTo(0,60);
        cxt.stroke();
        cxt.closePath();
        cxt.restore();
        cxt.restore();
    }
    setInterval(clock,1000)
})