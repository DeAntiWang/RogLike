let Engine = Matter.Engine,
    World = Matter.World,
    Vector = Matter.Vector,
    Render = Matter.Render,
    Bodies = Matter.Bodies,
    Body = Matter.Body;
let appWidth,
    appHeight,
    wholeHeight;
let me = null;

function initScene() {
    let engine = Engine.create({
        enableSleeping: true    // 开启睡眠模式，提高引擎效率
    });
    let options = {
        width: appWidth,
        height: appHeight,
        wireframes: false,
        background: '#ffffff',
        hasBounds: true,
        showVelocity: true
    };

    // 创建刚体
    let rect = Bodies.rectangle(200, 100, 50, 50), // 矩形
        circle = Bodies.circle(300, 100, 25), // 圆
        leftWall = Bodies.rectangle(-2, appHeight/2, 1, appHeight, {
            isStatic: true
        }), // 左墙
        rightWall = Bodies.rectangle(appWidth+2, appHeight/2, 1, appHeight, {
            isStatic: true
        }), // 右墙
        ceil = Bodies.rectangle(appWidth/2, -2, appWidth, 1, {
            isStatic: true
        }), // 天花板
        ground = Bodies.rectangle(appWidth/2, 580, appWidth, 32, {
            isStatic: true,
            background: 'black'
        }); // 地板
    me = Bodies.circle(50, wholeHeight-400, 20, {
        density: 0.68, // 密度
        restitution: 0.4 // 弹性
    });

    // 将刚体添加到世界中
    World.add(engine.world, [rect, circle, me, ground, leftWall, rightWall, ceil]);

    let render = Render.create({
        element: document.body,
        engine: engine,
        options: options
    });

    Engine.run(engine);
    Render.run(render);
}

function initNipple() {
    let controller = nipplejs.create({
        zone: document.getElementById('static'),
        mode: 'static',
        position: {left: 'calc(100% - 80px)', top: 'calc(100% - 70px)'},
        color: 'rgb(180,180,180)'
    });
    controller.on('move', function(evt, data) {
        let x = data.position.x-appWidth+80;
        // 给横向加速度
        let force = Vector.create(x*0.005, 0);
        addForce(force)
    });
}

function addForce(force) {
    Body.applyForce(me, me.position, force);
}

function bounce() {
    console.log(me);
    Body.applyForce(me, me.position, {x: 0, y: -50*0.51});
}

window.onload = () => {
    appWidth = document.body.clientWidth;
    appHeight = document.body.clientHeight-140;
    wholeHeight = document.body.clientHeight;
    initScene();
    initNipple();
};
