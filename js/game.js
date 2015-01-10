
var Game = function(){
    var that = this;
    document.onreadystatechange = function () {
        if (document.readyState == "complete") {
            that.run();
        }
    }
};

Game.prototype.run = function(){
    var that = this;
    this.startLevel(0, 'win');
}

Game.prototype.endLevel = function(){
    console.log(this.currLevelId);
    document.querySelector('#game_container'+this.currLevelId).innerHTML = '';
    return this;
}

Game.prototype.startLevel = function(lno, endstate){
    var that = this;
    var ldetails = this.levels[lno];
    if (ldetails.started) {
        return;
    }
        
    if (endstate === 'win') {
        var callback = function(endstate){
            that.endLevel().startLevel(lno+1, endstate);
        }
    } else {
        var callback = function(endstate){
            that.endLevel().startLevel(lno, endstate);
        }
    }

    this.levels[lno].started = true;
    setTimeout(function(){
        that.levels[lno].started = false;
    }, 2000);

    this.currLevelId = ((Math.random() * 1000000000)+'').replace('.','');
    var el = document.createElement('div');
    el.setAttribute('id','game_container'+this.currLevelId);
    document.body.appendChild(el);
    this.runningLevel = new Level(callback, this.currLevelId, ldetails);

    return this.runningLevel;

}

Game.prototype.levels = [
    {},
    {}
];
