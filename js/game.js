
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
    if (!getURLParameter()) {
        setURLParameter(1);
    }
    this.startLevel( getURLParameter()-1 );
}


Game.prototype.startLevel = function(lno){
    var that = this;
    var ldetails = this.levels[lno];
    
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

}


function getURLParameter() {
    var n = decodeURIComponent(
        (RegExp('[?|&]level=' + '(.+?)(&|$)').exec(location.search)||[null,null])[1]
    );
    n = +(n.replace('/',''));
    return n;
}
function setURLParameter(value){
    var search = '?level=' + value;
    window.location.href = window.location.href.split('?')[0] + search;
}

