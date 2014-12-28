var Bugs = function(){
    var that = this;
    document.onreadystatechange = function () {
        if (document.readyState == "complete") {
            that.run();
        }
    }
};

Bugs.prototype.bounds = {
    x: 800,
    y: 600
}

Bugs.prototype.run = function(){
    var that = this;
    this.game = new PixelJS.Engine();
    this.game.init({
        container: 'game_container',
        width: this.bounds.x,
        height: this.bounds.y
    });
        
        
    this.addBackground();
    this.addPlayer();
    this.stockBullets();
    this.spawnBugs();
    this.spawnBuildings();

    this.playerLayer.registerCollidable(this.player);
    this.enemies.forEach(function(en, i){
        that.enemyLayer.registerCollidable(en);
    });
    this.bullets.forEach(function(bullet, i){
        that.bulletLayer.registerCollidable(bullet);
    });

    /* TESTBED 
    
    var bullet = this.bulletLayer.createEntity();
    bullet.pos = { x: 500, y: 150 };
    bullet.size = { width: 12, height: 16 };
    bullet.asset = new PixelJS.AnimatedSprite();
    bullet.asset.prepare({
        name: 'coin.png',
        frames: 8,
        rows: 1,
        speed: 80,
        defaultFrame: 0
    });
    /* END */



    console.log('a');



    this.game.loadAndRun(function (elapsedTime, dt) {
        
        that.player.$updateDirection();
        
        that.enemies.forEach(function(enemy){
            enemyAi(enemy, that);
        });
        
        that.bullets.forEach(function(bullet, i){    
            bullet.$move();
        });
        
        function enemyAi(en, that){
            var enemy = en;
            if (enemy.direction.y) {
                enemy.moveUp();
            } else {
                enemy.moveDown();
            }
        
            if (enemy.direction.x) {
                enemy.moveLeft();
            } else {
                enemy.moveRight();
            }
        
        
        
            var pos = enemy.pos;
            if (pos.y < 50) {
                enemy.direction.y = false;
            } else if (pos.y > that.bounds.y - 50) {
                enemy.direction.y = true;
            }


            if (pos.x < 50) {
                enemy.direction.x = false;
            } else if (pos.x > that.bounds.x - 50) {
                enemy.direction.x = true;
            }
            
        }

    });
    
    
}

Bugs.prototype.addBackground = function(){
    var game = this.game;
    var backgroundLayer = game.createLayer('background');
    var grass = backgroundLayer.createEntity();
    backgroundLayer.static = true;
    grass.pos = { x: 0, y: 0 };
    grass.asset = new PixelJS.Tile();
    grass.asset.prepare({
        name: 'grass.png',
        size: { 
            width: 800, 
            height: 600 
        }
    });
    
}

Bugs.prototype.spawnBugs = function(){
    this.enemyLayer = this.game.createLayer('enemies');
    var numberOfBugs = 5;
    for (var i = 0; i < 5; i++) {
        this.spawnBug();
    }
}

Bugs.prototype.spawnBuildings = function(){
    this.buildingLayer = this.game.createLayer('buildings');
    var numberOfBuildings = 5;
    for (var i = 0; i < 5; i++) {
        this.spawnBuilding();
    }
}


Bugs.prototype.addPlayer = function(){
    var that = this;
    var game = this.game;
    var playerLayer = game.createLayer('players');
    var player = new PixelJS.Player();
    player.addToLayer(playerLayer);
    player.pos = { x: 200, y: 300 };
    player.size = { width: 32, height: 32 };
    player.velocity = { x: 100, y: 100 };
    player.asset = new PixelJS.AnimatedSprite();
    player.asset.prepare({ 
        name: 'char.png', 
        frames: 3, 
        rows: 4,
        speed: 100,
        defaultFrame: 1
    });
    
    player.onCollide(this.playerCollision.bind(this));
    
    
    game.on('keyDown', function (keyCode) {
        if (keyCode === PixelJS.Keys.Space) {
            console.log('fire!');
            // console.log(that.spawnBullet);
            that.fireBullet( that.player.pos );
        }
    });

    player.$lastDirection = PixelJS.Directions.Down;
    player.$updateDirection = function(){
        if (player.direction !== 0) {
            player.$lastDirection = player.direction;
        }
    }



    this.playerLayer = playerLayer;
    this.player = player;
}

Bugs.prototype.enemies = [];
Bugs.prototype.spawnBug = function(){
    var game = this.game;
    var enemy = new PixelJS.Entity();
    enemy.addToLayer(this.enemyLayer);
    var x = Math.random() * this.bounds.x;
    var y = Math.random() * this.bounds.y;
    enemy.pos = { x: x, y: y };
    enemy.size = { width: 32, height: 32 };
    enemy.velocity = { x: 50, y: 50 };
    enemy.asset = new PixelJS.AnimatedSprite();
    enemy.asset.prepare({ 
        name: 'bug.png', 
        frames: 3, 
        rows: 4,
        speed: 100,
        defaultFrame: 1
    });
    this.enemies.push(enemy);
    enemy.direction = {
        y: true,
        x: true
    }
}

Bugs.prototype.buildings = [];
Bugs.prototype.spawnBuilding = function(){
    var game = this.game;
    var building = new PixelJS.Entity();
    building.addToLayer(this.buildingLayer);
    var x = Math.random() * this.bounds.x;
    var y = Math.random() * this.bounds.y;
    building.pos = { x: x, y: y };
    building.size = { width: 32, height: 32 };
    building.velocity = { x: 50, y: 50 };
    building.asset = new PixelJS.AnimatedSprite();
    building.asset.prepare({ 
        name: 'char.png', 
        frames: 3, 
        rows: 4,
        speed: 100,
        defaultFrame: 1
    });
    this.buildings.push(building);
    building.direction = {
        y: true,
        x: true
    }
}


Bugs.prototype.playerCollision = function(entity){
    var that = this;
    var enemies = this.enemies;
    console.log(enemies);
    for (var i = 0; i < enemies.length; i++) {
        if (entity === enemies[i]) {
            console.log('Ouch!');
            jumpBack(that.player);
        }
    }
    
    function jumpBack(player){
        var pos = player.pos;
        if (player.direction == PixelJS.Directions.Left) {
            console.log('Player is facing left');
            pos.x += 50;
        } else if (player.direction == PixelJS.Directions.Right) {
            console.log('Player is facing right');
            pos.x -= 50;
        }
        player.moveTo( pos.x, pos.y, 1000 );
        
    }

}

Bugs.prototype.bullets = [];
Bugs.prototype.stockBullets = function(){
    var that = this;
    this.bulletLayer = this.game.createLayer('bullets');
    var bullet;
    for (var i = 0; i < 50; i++) {
        
        bullet = this.bulletLayer.createEntity();
        bullet.pos = { x: -20, y: -20 };
        bullet.size = { width: 12, height: 16 };
        bullet.asset = new PixelJS.AnimatedSprite();
        bullet.asset.prepare({
            name: 'coin.png',
            frames: 8,
            rows: 1,
            speed: 80,
            defaultFrame: 0
        });
        
        bullet.onCollide(this.bulletImpact.bind(this));
    
    
        bullet.$move = function(){
            var dir = this.$direction;
            switch (dir) {
            case PixelJS.Directions.Right:
                this.pos.x += 10;
                break;            
            case PixelJS.Directions.Left:
                this.pos.x -= 10;
                break;            
            case PixelJS.Directions.Up:
                this.pos.y -= 10;
                break;            
            case PixelJS.Directions.Down:
                this.pos.y += 10;
                break;            
            }
            this.moveTo(this.pos.x, this.pos.y);
            
        }
        bullet.$end = function(){
            this.pos = { x: -20, y: -20 };
            this.$fired = false;
        }
        bullet.$fired = false;
        // bullet.update = bullet.$move;
        this.bullets.push(bullet);
        
    }
    
}
Bugs.prototype.fireBullet = function(newPos){
    var that = this;
    var bullets = this.bullets;
    var fired = false;
    bullets.forEach(function(bullet){
        if (!fired && !bullet.$fired) {
            bullet.pos = {
                x: newPos.x,
                y: newPos.y
            };
            bullet.$direction = that.player.$lastDirection;
            bullet.$fired = true;
            setTimeout(function(){
                bullet.$end();
            },3000);
            fired = true;
        }
    })
}

Bugs.prototype.bulletImpact = function(entity){
    var that = this;
    var enemies = this.enemies;
    // console.log(enemies);
    for (var i = 0; i < enemies.length; i++) {
        if (entity === enemies[i]) {
            var enemy = enemies[i];
            // console.log('Bug hit!');
            enemy.dispose();
        }
    }

}

