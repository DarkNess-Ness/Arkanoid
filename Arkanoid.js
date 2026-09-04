const canvas = document.getElementById('gameArkan');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const ctx = canvas.getContext('2d');

//задаем блоки и цвета для уровня
const level1 = [
    [],
    [],
    [],
    ['grey','grey', 'grey', 'grey', 'grey', 'grey', 'grey', 'grey', 'grey', 'grey', 'grey','grey', 'grey', 'grey', 'grey'],
    ['red','red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'red'],
    ['blue','blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue'],
    ['orange','orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange'],
    ['pink','pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink'],
    ['green','green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'],
    [],
    []
];

const colorlev = {
    'grey': '#808080',
    'red': '#7e0505',
    'blue': '#1b1b9e',
    'orange': '#FFA500',
    'pink': '#ee526c',
    'green': '#6ff36f'
};
//задаем размеры блоков
const brickWidth = 54;
const brickHeight = 20;
//делаем отступы между блоками
const brickGap = 5;
//задаем размеры стенок
//920 − (15 × 54 + 5 × 20) = 40px
//делим пополам, получаем по 20px с каждой стороны
const wallSize = 20;

//задаем платформу игрока и ее размеры
const platform = {
    x: canvas.width / 2 - brickWidth /2,
    y: 540,
    width: brickWidth+20,
    height: brickHeight,
    dx: 0,
};
//задаем мяч и его размеры
const ball = {
    x: platform.x + (platform.width - 10) / 2,
    y: platform.y - 10,
    width: 10,
    height: 10,
    speed: 2,
    dx: 0,
    dy: 0
};
//создаем массив для блоков
const bricks = [];
//создаем блоки
for (let row = 0; row < level1.length; row++) {
    for (let col = 0; col < level1[row].length; col++) {
        //получаем цвет блока из массива
        const color = level1[row][col];
        //если цвет блока не пустой, то создаем блок
        bricks.push({
            x: wallSize + col * (brickWidth + brickGap),
            y: wallSize + row * (brickHeight + brickGap),
            width: brickWidth,
            height: brickHeight,
            color: colorlev[color]
        });
    }
}
let score = 0;
let lives = 3;
//функция для проверки столкновения объектов
// взяли отсюда: https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
function collides(obj1, obj2) {
  return obj1.x < obj2.x + obj2.width &&
         obj1.x + obj1.width > obj2.x &&
         obj1.y < obj2.y + obj2.height &&
         obj1.y + obj1.height > obj2.y;
}
//нажатия клавиш игроком
document.addEventListener('keydown', (e) => {
    if ( e.key === 'ArrowLeft') {
        platform.dx = -3;
    } else if ( e.key === 'ArrowRight') {
        platform.dx = 3;
    }
    // если мяч стоит на месте и игрок нажал пробел, то запускаем мяч
    if (ball.dx === 0 && ball.dy === 0 && (e.key === ' ' || e.key === 'Spacebar')) {
        ball.dx = ball.speed;
        ball.dy = -ball.speed;
    }
});
// игрок отпустил клавиши
document.addEventListener('keyup', (e) => {
    if ( e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        platform.dx = 0;
    }
});



function loop() {
    //очищаем поле и рисуем заново
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //двигаем платформу
    platform.x += platform.dx;
    // проверяем, чтобы платформа не выходила за границы
    if (platform.x < wallSize) {
        platform.x = wallSize;
    }
    else if (platform.x + platform.width > canvas.width - wallSize) {
        platform.x = canvas.width - wallSize - platform.width;
    }
    if (ball.dx === 0 && ball.dy === 0) {
    ball.x = platform.x + (platform.width - ball.width) / 2;
    ball.y = platform.y - ball.height;
}
    //двигаем мяч
    ball.x += ball.dx;
    ball.y += ball.dy;
    // проверяем, чтобы мяч не выходил за границы
    if (ball.x < wallSize) {
        ball.x = wallSize;
        ball.dx *= -1;
    } else if (ball.x + ball.width > canvas.width - wallSize) {
        ball.x = canvas.width - wallSize - ball.width;
        ball.dx *= -1;
    }// проверяем, чтобы мяч не выходил за верхнюю границу
    if (ball.y < wallSize) {
        ball.y = wallSize;
        ball.dy *= -1;
    }
    if (ball.y > canvas.height) {
        // если мяч упал за нижнюю границу, то останавливаем его и возвращаем на стартовую позицию
        ball.x = platform.x + (platform.width - ball.width) / 2;
        ball.y = platform.y - ball.height;
        ball.dx = 0;
        ball.dy = 0;
        lives--;
        livesElement.textContent = lives;
        if (lives === 0) {
            window.location.href = "game-over.html";           
        }
    }

    // проверяем столкновение мяча с платформой
    if (collides(ball, platform)) {
        ball.dy *= -1;

        ball.y = platform.y - ball.height; // чтобы мяч не застрял в платформе
        // меняем направление мяча в зависимости от того, куда он попал на платформе
        const platformCenter = platform.x + platform.width / 2;
        const ballCenter = ball.x + ball.width / 2;
        const distanceFromCenter = ballCenter - platformCenter;
        const maxDistance = platform.width / 2;
        const angle = (distanceFromCenter / maxDistance) * (Math.PI / 4);
        ball.dx = Math.sin(angle) * ball.speed;
        ball.dy = -Math.cos(angle) * ball.speed;
    }
        //проверяем столкновение мяча с блоками
        for (let i = 0; i < bricks.length; i++) {
            const brick = bricks[i];
            if (collides(ball, brick)) {
                // удаляем блок из массива
                bricks.splice(i, 1);
                score += 10;
                scoreElement.textContent = score;
                if (bricks.length === 0) {
                    // все блоки уничтожены
                    window.location.href = "game-win.html";}
                // меняем направление мяча в зависимости от того, с какой стороны он столкнулся с блоком
                if (ball.y + ball.height - ball.speed <= brick.y || ball.y >= brick.y + brick.height - ball.speed) {
                    ball.dy *= -1;
                }// если мяч столкнулся с блоком сбоку, то меняем направление по горизонтали
                else {
                    ball.dx *= -1;
                }// выходим из цикла как только нашли столкновение
                break;
            }
        }

        ctx.fillStyle = 'lightgrey';
        ctx.fillRect(0, 0, canvas.width, wallSize); // верхняя стенка
        ctx.fillRect(0, 0, wallSize, canvas.height); // левая стенка
        ctx.fillRect(canvas.width - wallSize, 0, wallSize, canvas.height); // правая стенка     
        
        // рисуем мяч
        //ctx.fillRect(ball.x, ball.y, ball.width, ball.height);
        ctx.beginPath();
        ctx.arc(ball.x + ball.width / 2, ball.y + ball.height / 2, ball.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'lightblue';
        ctx.fill();
        ctx.closePath();

        
        // рисуем блоки
        bricks.forEach(function(brick) {
            ctx.fillStyle = brick.color;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        });

        // рисуем платформу
        ctx.fillStyle = 'peachpuff';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

 }
loop();
