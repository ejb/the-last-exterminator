var Level = function(callback, opts){
    var that = this;
    this.callback = callback;
    this.opts = opts;
    this.run();
};

Level.prototype.bounds = {
    x: 800,
    y: 600
}

Level.prototype.run = function(){
    var that = this;
    this.game = new PixelJS.Engine();
    this.game.init({
        container: ('game_container'),
        width: this.bounds.x,
        height: this.bounds.y
    });
    
    
    this.shootSound = this.game.createSound('shoot');
    this.shootSound.prepare({ name: 'shoot.wav' });
    this.collapseSound = this.game.createSound('collapse');
    this.collapseSound.prepare({ name: 'collapse.wav' });
    this.crySound = this.game.createSound('cry');
    this.crySound.prepare({ name: 'cry.wav' });
    this.themeSound = this.game.createSound('theme');
    this.themeSound.prepare({ name: 'theme.wav' });
        
    this.addBackground();
    if (this.opts.noPlayer !== true) {
        this.addPlayer();
        this.stockBullets();        
    }
    this.spawnBugs();
    this.numberOfBuildings = this.opts.buildings || Math.ceil(Math.random()*5);
    this.spawnBuildings();
    this.spawnCollapsedBuildings();

    if (this.opts.noPlayer !== true) {
        this.playerLayer.registerCollidable(this.player);
        this.enemies.forEach(function(en, i){
            that.enemyLayer.registerCollidable(en);
        });
        this.bullets.forEach(function(bullet, i){
            that.bulletLayer.registerCollidable(bullet);
        });
        this.buildings.forEach(function(building, i){
            that.buildingLayer.registerCollidable(building);
        });
    }
    
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






    this.game.loadAndRun(function (elapsedTime, dt) {
        
        that.elapsedTime = elapsedTime;
        that.dt = dt;
        
        if (that.opts.noPlayer && !that.themePlayed) {
            that.themeSound.play();
            that.themePlayed = true;
        }
        
        
        if (that.opts.noPlayer !== true) {
            that.player.$updateDirection();
        }
        
        that.enemies.forEach(function(enemy){
            enemy.$ai(that);
        });
        
        if (that.opts.noPlayer !== true) {
            that.bullets.forEach(function(bullet, i){    
                bullet.$move();
            });
        }        

    });
    
    
}

Level.prototype.addBackground = function(){
    var game = this.game;
    var backgroundLayer = game.createLayer('background');
    var floor = backgroundLayer.createEntity();
    backgroundLayer.static = true;
    floor.pos = { x: 0, y: 0 };
    floor.asset = new PixelJS.Tile();
    floor.asset.prepare({
        name: 'floor.png',
        size: { 
            width: 800, 
            height: 600 
        }
    });
    
}

Level.prototype.spawnBugs = function(){
    this.enemyLayer = this.game.createLayer('enemies');
    var numberOfBugs = this.opts.enemies;
    for (var i = 0; i < numberOfBugs; i++) {
        this.spawnBug();
    }
}

Level.prototype.spawnBuildings = function(){
    this.buildingLayer = this.game.createLayer('buildings');
    for (var i = 0; i < this.numberOfBuildings; i++) {
        this.spawnBuilding();
    }
}

Level.prototype.spawnCollapsedBuildings = function(){
    for (var i = 0; i < this.numberOfBuildings; i++) {
        this.spawnCollapsedBuilding();
    }
}

Level.prototype.playerHealth = 3;
Level.prototype.addPlayer = function(){
    var that = this;
    var game = this.game;
    var playerLayer = game.createLayer('players');
    var player = new PixelJS.Player();
    player.addToLayer(playerLayer);
    player.pos = { x: this.bounds.x/2, y: this.bounds.y/2 };
    player.size = { width: 32, height: 32 };
    player.velocity = { x: 100, y: 100 };
    player.asset = new PixelJS.AnimatedSprite();
    player.asset.prepare({ 
        name: 'player_sheet.png', 
        frames: 4, 
        rows: 4,
        speed: 70,
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

Level.prototype.enemies = [];
Level.prototype.spawnBug = function(){
    var game = this.game;
    var enemy = new PixelJS.Entity();
    enemy.addToLayer(this.enemyLayer);
    var x = Math.random() * this.bounds.x;
    var y = Math.random() * this.bounds.y;
    while (
        (x > this.bounds.x/2-100) && (x < this.bounds.x/2+100) &&
        (y > this.bounds.y/2-100) && (y < this.bounds.y/2+100)
    ) {
        x = Math.random() * this.bounds.x;
        y = Math.random() * this.bounds.y;
    }
    
    enemy.pos = { x: x, y: y };
    enemy.size = { width: 32, height: 32 };
    enemy.velocity = { x: 30, y: 30 }; // should be 50
    enemy.asset = new PixelJS.AnimatedSprite();
    enemy.asset.prepare({ 
        name: 'bug_sheet.png',
        frames: 2,
        rows: 4,
        speed: 80,
        defaultFrame: 1
    });
    enemy.direction = this.ranDir();
    enemy.timeInDirection = 0;
    enemy.$moveUp = function(){
        this.moveUp();
        this.asset.row = 0;
    }
    enemy.$moveRight = function(){
        this.moveRight();
        this.asset.row = 2;
    }
    enemy.$moveLeft = function(){
        this.moveLeft();
        this.asset.row = 1;
    }
    enemy.$moveDown = function(){
        this.moveDown();
        this.asset.row = 3;
    }
    enemy.$reverse = function(){
        
    }
    enemy.$ai = function(that){
        
        var num = Math.random() * 10 * enemy.timeInDirection;
        if ((enemy.timeInDirection > 300) || (num > 300)) {
            enemy.direction = that.ranDir();
            enemy.timeInDirection = 0;
        }
        enemy.timeInDirection++;
        
        var pos = enemy.pos;
        if ((pos.y < 50) && (enemy.direction === PixelJS.Directions.Up)) {
            enemy.direction = PixelJS.Directions.Down;
            enemy.timeInDirection = 0;
        } else if ((pos.y > that.bounds.y - 50) && (enemy.direction === PixelJS.Directions.Down)) {
            enemy.direction = PixelJS.Directions.Up;
            enemy.timeInDirection = 0;
        }
        
        if ((pos.x < 50) && (enemy.direction === PixelJS.Directions.Left)) {
            console.log('far left')
            enemy.direction = PixelJS.Directions.Right;
            enemy.timeInDirection = 0;
        } else if ((pos.x > that.bounds.x - 50) && (enemy.direction === PixelJS.Directions.Right)) {
            console.log('far right')
            enemy.direction = PixelJS.Directions.Left;
            enemy.timeInDirection = 0;
        }
        
        
        enemy.asset.startAnimating();
        switch (enemy.direction) {
        case PixelJS.Directions.Left:
            enemy.$moveLeft();
            break;
        case PixelJS.Directions.Right:
            enemy.$moveRight();
            break;
        case PixelJS.Directions.Up:
            enemy.$moveUp();
            break;
        case PixelJS.Directions.Down:
            enemy.$moveDown();
            break;
        case false:
            enemy.asset.stopAnimating();
            break;
        default:
            
        }
        
    }
    this.enemies.push(enemy);
    window.lastbug = enemy;
}

Level.prototype.ranDir = function(){
    var n = Math.random() * 5;
    if (n < 1) {
        return PixelJS.Directions.Up;
    } else if (n < 2) {
        return PixelJS.Directions.Down;
    } else if (n < 3) {
        return PixelJS.Directions.Left;
    } else if (n < 4) {
        return PixelJS.Directions.Right;
    } else {
        return false;
    }
}

Level.prototype.buildings = [];
Level.prototype.buildingLocations = {};
Level.prototype.spawnBuilding = function(){
    var that = this;
    var game = this.game;
    var building = new PixelJS.Entity();
    building.addToLayer(this.buildingLayer);    
    
    // horz: 4 buildings
    // vert: 3 buildings
        
    var x = Math.floor( Math.random() * 4 ) * 200 + 20;
    var y = Math.floor( Math.random() * 3 ) * 200 + 30;
    console.log(this.buildingLocations);
    while (this.buildingLocations[x+''+y]) {
        x = Math.floor( Math.random() * 4 ) * 200 + 20;
        y = Math.floor( Math.random() * 3 ) * 200 + 30;
        
    }
    this.buildingLocations[x+''+y] = true;
    console.log(x,y);
    building.pos = { x: x, y: y };
    building.size = { width: 128, height: 128 };
    building.velocity = { x: 50, y: 50 };
    building.asset = new PixelJS.Sprite();
    building.asset.prepare({ 
        name: 'building.png', 
        frames: 2,
        rows: 1,
        speed: 100,
        defaultFrame: 0
    });
    building.$collapsed = false;
    building.$collapse = function(index){
        console.log('collapse')
        this.$collapsed = true;
        that.collapsedBuildings[index].moveTo(this.pos.x, this.pos.y);
        this.dispose();
        that.collapseSound.play();
    }
    this.buildings.push(building);
    building.direction = {
        y: true,
        x: true
    }
}

Level.prototype.collapsedBuildings = [];
Level.prototype.spawnCollapsedBuilding = function(){
    var game = this.game;
    var building = new PixelJS.Entity();
    building.addToLayer(this.buildingLayer);
    building.pos = { x: -1000, y: -1000 };
    building.size = { width: 128, height: 128 };
    building.asset = new PixelJS.Sprite();
    building.asset.prepare({ 
        name: 'building2.png', 
        frames: 2,
        rows: 1,
        speed: 100,
        defaultFrame: 0
    });
    this.collapsedBuildings.push(building);
}

Level.prototype.recentlyHit = false;
Level.prototype.playerCollision = function(entity){
    var that = this;
    this.recentlyHit = checkIfStillTimeout(this.recentlyHit, this.dt);
    var enemies = this.enemies;
    // console.log(this.recentlyHit);
    if (this.recentlyHit === false) {
        for (var i = 0; i < enemies.length; i++) {
            if (entity === enemies[i]) {
                this.playerHealth--;
                this.endLevel('fail');
                console.log('Ouch! Health now at '+this.playerHealth);
                this.recentlyHit = this.dt;
                // jumpBack(that.player);
            }
        }
    }
        
    function checkIfStillTimeout(rh, dt){
        if (rh < dt - 0.01) {
            return false;
        }
        return dt;
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

Level.prototype.bullets = [];
Level.prototype.stockBullets = function(){
    var that = this;
    this.bulletLayer = this.game.createLayer('bullets');
    var bullet;
    for (var i = 0; i < 50; i++) {
        
        bullet = this.bulletLayer.createEntity();
        bullet.pos = { x: -20, y: -20 };
        bullet.size = { width: 16, height: 16 };
        bullet.asset = new PixelJS.AnimatedSprite();
        bullet.asset.prepare({
            name: 'bullet.png',
            frames: 2,
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
Level.prototype.fireBullet = function(newPos){
    var that = this;
    var bullets = this.bullets;
    var fired = false;
    bullets.forEach(function(bullet){
        console.log(fired);
        if (!fired && !bullet.$fired) {
            that.shootSound.play();
            bullet.$fired = true;
            fired = true;
            bullet.pos = {
                x: newPos.x+8,
                y: newPos.y+8
            };
            bullet.$direction = that.player.$lastDirection;
            setTimeout(function(){
                bullet.$end();
            },300);
        }
    })
}

Level.prototype.bulletImpact = function(entity){
    var that = this;
    var enemies = this.enemies;
    var buildings = this.buildings;
    // console.log(enemies);
    for (var i = 0; i < enemies.length; i++) {
        if (entity === enemies[i]) {
            var enemy = enemies[i];
            // console.log('Bug hit!');
            this.crySound.play();
            enemy.dispose();
            this.enemies.splice(i, 1);
            console.log('xxxx', this.enemies, this.enemies.length);
            if (this.enemies.length === 0) {
                console.log(this.endLevel);
                this.endLevel('win');
            }
        }
    }
    var buildingsHit = [];
    for (var i = 0; i < buildings.length; i++) {
        if ((entity === buildings[i])) {
            var building = buildings[i];
            console.log(building.$collapsed, 'collapsed?');
            if (building.$collapsed === false) {
                building.$collapse(i);
            }
        }
    }

}

Level.prototype.endLevel = function(state){
    console.log(this);
    this.callback(state);
    console.log(this);
}
