let Engine = Matter.Engine,
    World = Matter.World,
    Vector = Matter.Vector,
    Render = Matter.Render,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Events = Matter.Events,
    Composite = Matter.Composite;
                        // Matter.Js
let appWidth,
    appHeight,
    wholeHeight;        // app属性
let me=null,
    wall=null,
    dwall=null;         // 地图元素
let canBounce = false;  // 是否可以使用跳跃
let firstStart = true;  // 是否还未开始移动
let historyPath = [];   // 历史路径

// 物理引擎
function initScene() {
    // 创建引擎
    let engine = Engine.create({
        enableSleeping: true    // 开启睡眠模式，提高引擎效率
    });
    // Render配置项
    let options = {
        width: appWidth,
        height: appHeight,
        wireframes: false,
        background: '#ffffff',
        hasBounds: true,
        showVelocity: true
    };

    initMap();

    // 安全墙体内部成员ID
    let wallsId = Composite.allBodies(wall).map(x => x.id);
    // 危险墙体内部成员ID
    let dwallsId = Composite.allBodies(dwall).map(x => x.id);


    // 把元素添加到世界中
    World.add(engine.world, [me, wall, dwall]);

    // 创建Render
    let render = Render.create({
        element: document.body,
        engine: engine,
        options: options
    });

    // 运行引擎和Render
    Engine.run(engine);
    Render.run(render);

    // 监听碰撞事件
    Events.on(engine, "collisionStart", (evt) => {
        evt.source.broadphase.pairsList.forEach( val => {
            // 判断me和安全墙体相撞
            if(
                (val[0].id===me.id && wallsId.indexOf(val[1].id)!==-1) ||
                (val[1].id===me.id && wallsId.indexOf(val[0].id)!==-1)
            ) {
                canBounce = true;
            }
            // 判断me和危险墙体相撞
            if(
                (val[0].id===me.id && dwallsId.indexOf(val[1].id)!==-1) ||
                (val[1].id===me.id && dwallsId.indexOf(val[0].id)!==-1)
            ) {
                // TODO 死亡逻辑
                console.log('death');
            }
        });
    });
}

// 初始化地图
function initMap() {
    // 创建刚体
    let leftWall = Bodies.rectangle(-2, appHeight/2, 1, appHeight, {
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
            background: '#000000'
        }); // 地板
    let test = Bodies.rectangle(appWidth/2, 530, 50, 50, {
        isStatic: true
    });

    // 主角
    me = Bodies.circle(50, wholeHeight-400, 20, {
        density: 1, // 密度
        restitution: 0 // 弹性
    });

    // 安全墙体
    wall = Composite.create();
    Composite.add(wall, leftWall);
    Composite.add(wall, rightWall);
    Composite.add(wall, ground);
    Composite.add(wall, ceil);

    // 危险墙体
    dwall = Composite.create();
    Composite.add(dwall, test);
}


// 摇杆
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
    controller.on('start', function() {
        if(firstStart) {
            // TODO 开始记录路径
            return historyPath.push([]);
            let id = savePath(array, me);
            setTimeout(()=>{clearInterval(id); console.log('oh',array)},1000);
            firstStart=false;
        }
    });
}

// 给主角施加力
function addForce(force) {
    Body.applyForce(me, me.position, force);
}
// 主角弹跳纵向力
function bounce() {
    if(canBounce) {
        Body.applyForce(me, me.position, {x: 0, y: -50*0.51});
        canBounce=false;
    }
}

// 记录第n位角色路径
function savePath(array, obj) {
    let time = 0;
    return setInterval( () => {
        array.push({
            ...obj.position,
            time: time+=10
        });
    }, 20);
}

window.onload = () => {
    appWidth = document.body.clientWidth;
    appHeight = document.body.clientHeight-140;
    wholeHeight = document.body.clientHeight;
    initScene();
    initNipple();
};
