window.onload = () => {
    initScene();
    Nipple();
};

let Engine = Matter.Engine,
    World = Matter.World,
    Runner = Matter.Runner,
    Render = Matter.Render,
    Bodies = Matter.Bodies;

function initScene() {
    let appWidth = document.body.clientWidth;
    let appHeight = document.body.clientHeight-140;

    let engine = Engine.create();
    let options = {
        width: appWidth,
        height: appHeight,
        hasBounds: true,
        showVelocity: true
    };

    // 创建刚体
    let rect = Bodies.rectangle(200, 100, 50, 50), // 矩形
        circle = Bodies.circle(300, 100, 25), // 圆
        polygon = Bodies.polygon(450, 100, 5, 25), // 多边形
        trapezoid = Bodies.trapezoid(590, 100, 50, 50, 3), // 梯形
        ground = Bodies.rectangle(400, 580, 790, 60, {isStatic: true}),
        me = Bodies.circle(50, document.body.clientHeight-400, 20);

    // 将刚体添加到世界中
    World.add(engine.world, [rect, circle, me, ground]);


    let render = Render.create({
        element: document.body,
        engine: engine,
        options: options
    });

    Engine.run(engine);
    Render.run(render);
}

function Nipple() {
    let controller = nipplejs.create({
        zone: document.getElementById('static'),
        mode: 'static',
        position: {left: '50%', top: 'calc(100% - 70px)'},
        color: 'rgb(40,40,40)'
    });
}
