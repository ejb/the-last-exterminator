
var Game = function(levels){
    var that = this;
    this.levels = levels;
    document.onreadystatechange = function () {
        if (document.readyState == "complete") {
            that.run();
        }
    }
};

Game.prototype.run = function(){
    var that = this;
    
    if ((window.location.hash.indexOf('ctd') > -1) && getURLParameter()) {
        this.startLevel( getURLParameter() );
    } else if (window.location.search !== '?/') {
        window.location.search = '?/';
    } else {
        
        this.startLevel( 0 );

        
        $('.splash').addClass('ready');
        $('body').keyup(function(e){
           if(e.keyCode == 32){
               // user has pressed space
               setURLParameter(1);
           }
        });

        setInterval(function(){
            $('.splash').toggleClass('alt');
        },700);

    }
}


Game.prototype.startLevel = function(lno){
    var that = this;
    var ldetails = this.levels[lno];
    
    if (!ldetails) {
        this.gameover();
        return;
    }
    
    var callback = function(endstate){
        var thisLevel = getURLParameter();
        if (endstate === 'win') {
            setURLParameter( thisLevel+1 );
        } else {
            setURLParameter( thisLevel );
        }
    }

    var el = document.createElement('div');
    el.setAttribute('id','game_container');
    document.body.appendChild(el);

    new Level(callback, ldetails);
    window.location.hash = '';

}

Game.prototype.gameover = function(){
    document.write('Game over!<br>Thanks for playing.');
}

function getURLParameter() {
    var n = decodeURIComponent(
        (RegExp('[?|&]level=' + '(.+?)(&|$)').exec(location.search)||[null,null])[1]
    );
    n = +(n.replace('/',''));
    return n;
}
function setURLParameter(value){
    var r = Math.floor(Math.random()*1000);
    var search = '?level=' + value + '&c='+r+'/#ctd';
    window.location = window.location.href.split('?')[0].replace('#','') + search, '_self';
}

