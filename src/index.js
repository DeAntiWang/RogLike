let Engine = Matter.Engine,
    World = Matter.World,
    Vector = Matter.Vector,
    Render = Matter.Render,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Events = Matter.Events,
    Composite = Matter.Composite;
let engine=null;
// upside is about Matter.Js
let appWidth,
    appHeight,
    wholeHeight;        // app属性
let me=null,
    wall=null,
    dwall=null,
    aim=null;           // 地图元素
let canBounce = false;  // 是否可以使用跳跃
let firstStart = true;  // 是否还未开始移动
let historyPath = [];   // 历史路径
let pasts = [];         // 之前的影子
let interval=null;      // 现在正在跑的interval
const savePathInterval=20; // 记录路径间隔

// TODO tap使用方式 反墙跳(import) 画一关的地图

// 物理引擎
function initScene() {
    // 创建引擎
    engine = Engine.create({
        // enableSleeping: true    // 开启睡眠模式，提高引擎效率
    });
    // Render配置项
    let options = {
        width: appWidth,
        height: appHeight,
        wireframes: false,
        background: '#ffffff',
        hasBounds: true,
        showVelocity: true,     // DeBug项 显示每个物品上的矢量
        showIds: true           // DeBug项 显示每个物品的ID
    };

    // 初始化地图
    initMap();

    // 安全墙体内部成员ID
    let wallsId = Composite.allBodies(wall).map(x => x.id);
    // 危险墙体内部成员ID
    let dwallsId = Composite.allBodies(dwall).map(x => x.id);


    // 把元素添加到世界中
    World.add(engine.world, [me, aim, wall, dwall]);

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
                death();
            }
            // 判断游戏成功
            if(
                (val[0].id===me.id && val[1].id===aim.id) ||
                (val[1].id===me.id && val[0].id===aim.id)
            ) {
                aimIt();
            }
        });
    });
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
        addForce(force);
    });
    controller.on('start', function() {
        if(firstStart) {
            playHistory();
            let pathId = historyPath.push([])-1;
            interval = savePath(historyPath[pathId], me);
            firstStart=false;
        }
    });
}

// 初始化地图
function initMap() {
    // 创建安全刚体
    let leftWall = Bodies.rectangle(-2, appHeight/2, 1, appHeight, {
            isStatic: true,
            render: {
                fillStyle: 'black'
            }
        }), // 左墙
        rightWall = Bodies.rectangle(appWidth+2, appHeight/2, 1, appHeight, {
            isStatic: true,
            render: {
                fillStyle: 'black'
            }
        }), // 右墙
        ceil = Bodies.rectangle(appWidth/2, -2, appWidth, 1, {
            isStatic: true,
            render: {
                fillStyle: 'black'
            }
        }), // 天花板
        ground = Bodies.rectangle(appWidth/2, 580, appWidth, 32, {
            isStatic: true,
            render: {
                fillStyle: 'black'
            }
        }); // 地板
    // 创建危险刚体
    let test = Bodies.rectangle(appWidth/2+100, 530, 50, 50, {
        isStatic: true,
        render: {
            fillStyle: 'red'
        }
    });


    // 创建成功体
    aim = Bodies.rectangle(appWidth/2-100, 530, 50, 50, {
        isStatic: true,
        render: {
            fillStyle: 'green'
        }
    });
    // 主角
    me = Bodies.circle(appWidth/2, wholeHeight-205, 20, {
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

// 给主角施加力
function addForce(force) {
    Body.applyForce(me, me.position, force);
}

// 主角弹跳纵向力
function bounce() {
    if(canBounce) {
        if(firstStart) {
            playHistory();
            let pathId = historyPath.push([])-1;
            interval = savePath(historyPath[pathId], me);
            firstStart=false;
        }
        Body.applyForce(me, me.position, {x: 0, y: -50*0.51});
        canBounce=false;
    }
}

// 记录第n位角色路径
function savePath(array, obj) {
    return setInterval( () => {
        array.push({
            ...obj.position,
        });
    }, savePathInterval);
}

// 重放灵魂Path
function playHistory() {
    // 清除之前的影子
    pasts.forEach( val => {
        document.body.removeChild(val);
    });
    pasts = [];
    // 播放影子
    historyPath.forEach( val => {
        // TODO 播放
        let past = document.createElement('div');
        past.setAttribute('style', 'z-index:9999;position:fixed;width:40px;height:40px;border-radius: 100%;background: rgba(0,0,0,0.2);');
        pasts.push(past);
        document.body.appendChild(past);
        let cnt = 0;
        let player = setInterval( () => {
            if(val[cnt]!==undefined) {
                past.style.left = val[cnt].x-20+'px';
                past.style.top = val[cnt].y-20+'px';
            }else{
                clearInterval(player);
                // 影子不消失
            }
            cnt++;
        }, savePathInterval);
    });
}

// 死亡
function death() {
    console.log('death');
    clearInterval(interval);
    // console.log(historyPath);
    // 原先的消失，me回起始点，重置firstStart
    World.remove(engine.world, me);
    me = Bodies.circle(appWidth/2, wholeHeight-205, 20, {
        density: 1, // 密度
        restitution: 0 // 弹性
    });
    World.add(engine.world, me);
    firstStart=true;
}

// 胜利
function aimIt() {
    console.log('success');
    // 清理historyPath
    historyPath = [];
    // 停止记录路径
    if(interval) clearInterval(interval);
    alert('success');
}

// 启动
window.onload = () => {
    appWidth = document.body.clientWidth;
    appHeight = document.body.clientHeight-140;
    wholeHeight = document.body.clientHeight;
    initScene();
    initNipple();
};
