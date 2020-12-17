var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'phaser-example',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var useVelocityForMovement;
var stars;
var platforms;
var movingPlatforms;
var cursors;

var game = new Phaser.Game(config);
var speeds = [
    30,
    60,
    90,
    120,
    180,
];
var speedCursor = 0;

function preload ()
{
    this.load.image('sky', 'src/games/firstgame/assets/sky.png');
    this.load.image('ground', 'src/games/firstgame/assets/platform.png');
    this.load.image('star', 'src/games/firstgame/assets/star.png');
    this.load.spritesheet('dude', 'src/games/firstgame/assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create ()
{
    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    // Create a little hillock
    platforms.create(400, 520, 'ground').setScale(.125, 1).refreshBody();

    // platforms.create(600, 400, 'ground');
    // platforms.create(50, 250, 'ground');
    // platforms.create(750, 220, 'ground');
    movingPlatforms = this.physics.add.group({
        allowGravity:false,
        frictionX:1,
        immovable:true,
        velocityX:50,
    });
    movingPlatform = movingPlatforms.create(400, 400, 'ground');
    movingPlatform = movingPlatforms.create(475, 464, 'ground');

    player = this.physics.add.sprite(100, 450, 'dude');

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(player, movingPlatforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(stars, movingPlatforms);

    this.physics.add.overlap(player, stars, collectStar, null, this);
}

function update (time, delta)
{
    var speed = 160;
    if (this.input.keyboard.checkDown(cursors.shift, 250)) {
        speedCursor = Phaser.Math.Clamp(speedCursor + 1, 0, speeds.length - 1);
        this.physics.world.setFPS(speeds[speedCursor]);
    }
    if (this.input.keyboard.checkDown(cursors.space, 250)) {
        useVelocityForMovement = !useVelocityForMovement;
        console.log(useVelocityForMovement
            ? 'Using velocity for movement'
            : 'Using direct game object modification for movement'
        );
        player.setVelocityX(0);
    }
    if (cursors.left.isDown)
    {
        if (useVelocityForMovement)
        {
            player.setVelocityX(-160);
        }
        else
        {
            player.x -= speed * delta / 1000;
        }

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        if (useVelocityForMovement)
        {
            player.setVelocityX(160);
        }
        else
        {
            player.x += speed * delta / 1000;
        }

        player.anims.play('right', true);
    }
    else
    {
        if (useVelocityForMovement)
        {
            player.setVelocityX(0);
        }

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }
    for (let movingPlatform of movingPlatforms.children.entries) {
        if (movingPlatform.x >= 500)
        {
            movingPlatform.setVelocityX(-50);
        }
        else if (movingPlatform.x <= 300)
        {
            movingPlatform.setVelocityX(50);
        }
    }
}

function collectStar (player, star)
{
    star.disableBody(true, true);
}
