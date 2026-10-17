const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');

//задаем размеры игрового поля
const WIDTH = 920;
const HEIGHT = 600;
const WALL_SIZE = 20;

//размеры блоков
const BRICK_WIDTH = 54;
const BRICK_HEIGHT = 20;
const BRICK_GAP = 5;

//платформа и мяч
const PLATFORM_WIDTH = BRICK_WIDTH + 20;
const PLATFORM_HEIGHT = BRICK_HEIGHT;
const BALL_SIZE = 10;

//цвета блоков
const COLORS = {
    grey: 0x808080,
    red: 0x7e0505,
    blue: 0x1b1b9e,
    orange: 0xFFA500,
    pink: 0xee526c,
    green: 0x6ff36f
};
//расположение блоков в 1 уровне
const level1 = [
    [], [], [],
    Array(15).fill('grey'),
    Array(15).fill('red'),
    Array(15).fill('blue'),
    Array(15).fill('orange'),
    Array(15).fill('pink'),
    Array(15).fill('green'),
    [], []
];

async function startGame() {
    // создаем приложение PixiJS
    const app = new PIXI.Application();
    //настраиваем поле
    await app.init({
        width: WIDTH,
        height: HEIGHT,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
    });
    // заменяем старый канвас на холст Пикси
    const oldCanvas = document.getElementById('gameArkan');
    app.canvas.id = 'gameArkan';
    oldCanvas.replaceWith(app.canvas);

    //контейнеры стен, блоков и объектов
    const wallLayer = new PIXI.Container();
    const brickLayer = new PIXI.Container();
    const objectLayer = new PIXI.Container();

    app.stage.addChild(wallLayer);
    app.stage.addChild(brickLayer);
    app.stage.addChild(objectLayer);

    //стены
    const walls = new PIXI.Graphics()
        .rect(0, 0, WIDTH, WALL_SIZE)
        .rect(0, 0, WALL_SIZE, HEIGHT)
        .rect(WIDTH - WALL_SIZE, 0, WALL_SIZE, HEIGHT)
        .fill(0xD3D3D3);

    wallLayer.addChild(walls);

    //платформа
    const platform = {
        x: WIDTH / 2 - PLATFORM_WIDTH / 2,
        y: 540,
        width: PLATFORM_WIDTH,
        height: PLATFORM_HEIGHT,
        dx: 0
    };
    //создаем платформу графически
    const platformGraphic = new PIXI.Graphics()
        .rect(0, 0, platform.width, platform.height)
        .fill(0xC0C0C0);

    //устанавливаем в начальную позицию
    platformGraphic.position.set(platform.x, platform.y);
    objectLayer.addChild(platformGraphic);

    //мяч
    const ball = {
        x: 0,
        y: 0,
        width: BALL_SIZE,
        height: BALL_SIZE,
        speed: 4,
        dx: 0,
        dy: 0
    };

    //мяч графически
    const ballGraphic = new PIXI.Graphics()
        .circle(BALL_SIZE / 2, BALL_SIZE / 2, BALL_SIZE / 2)
        .fill(0xADD8E6);

    objectLayer.addChild(ballGraphic);

    //возвращаем мяч на платформу и останавливаем его
    function resetBall() {
        ball.x = platform.x + (platform.width - ball.width) / 2;
        ball.y = platform.y - ball.height;
        ball.dx = 0;
        ball.dy = 0;
    }

    //мяч в начальную позицию
    resetBall();

    //создаем блоки
    const bricks = [];

    //проходим по всем строкам и столбцам уровня
    for (let row = 0; row < level1.length; row++) {
        for (let col = 0; col < level1[row].length; col++) {
            //получаем цвет текущего блока
            const color = level1[row][col];
            //создаем графическое изображение блока
            const graphic = new PIXI.Graphics()
                .rect(0, 0, BRICK_WIDTH, BRICK_HEIGHT)
                .fill(COLORS[color]);
            //сохраняем координаты и размеры блока
            const brick = {
                x: WALL_SIZE + col * (BRICK_WIDTH + BRICK_GAP),
                y: WALL_SIZE + row * (BRICK_HEIGHT + BRICK_GAP),
                width: BRICK_WIDTH,
                height: BRICK_HEIGHT,
                graphic
            };
            //устанавливаем блок на поле, добавляем его на сцену и в массив
            graphic.position.set(brick.x, brick.y);
            brickLayer.addChild(graphic);
            bricks.push(brick);
        }
    }

    let score = 0;
    let lives = 3;
    let gameEnded = false;

    //отображаем начальные значения счета и жизней на странице
    scoreElement.textContent = score;
    livesElement.textContent = lives;

    //проверка столкновений
    function collides(a, b) {
        return a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
    }

    //обработчик клавиш
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    function handleKeyDown(e) {
        //запрещаем прокрутку страницы стрелками и пробелом
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
            e.code === 'Space') {
            e.preventDefault();
        }
        //двигаем платформу влево или вправо
        if (e.key === 'ArrowLeft') {
            platform.dx = -6;
        } else if (e.key === 'ArrowRight') {
            platform.dx = 6;
        }
        //запускаем мяч при нажатии пробела, если он не движется
        if (e.code === 'Space' && ball.dx === 0 && ball.dy === 0) {
            ball.dx = ball.speed;
            ball.dy = -ball.speed;
        }
    }
    //останавливаем платформу
    function handleKeyUp(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            platform.dx = 0;
        }
    }

    //основной игровой цикл Пикси
    function update(ticker) {
        //если игра завершена, больше ничего не обновляем
        if (gameEnded) return;

        //учитываем время кадра, ограничивая слишком большие значения
        const delta = Math.min(ticker.deltaTime, 2);

        //движение платформы
        platform.x += platform.dx * delta;
        //обработка выхода за левую границу поля
        if (platform.x < WALL_SIZE) {
            platform.x = WALL_SIZE;
        }
        //обработка выхода за правую границу поля
        if (platform.x + platform.width > WIDTH - WALL_SIZE) {
            platform.x = WIDTH - WALL_SIZE - platform.width;
        }

        platformGraphic.x = platform.x;

        //если мяч не запущен, он движется вместе с платформой
        if (ball.dx === 0 && ball.dy === 0) {
            ball.x = platform.x + (platform.width - ball.width) / 2;
            ball.y = platform.y - ball.height;
        }

        //движение мяча
        ball.x += ball.dx * delta;
        ball.y += ball.dy * delta;

        //столкновение мяча с боковыми стены
        if (ball.x < WALL_SIZE) {
            ball.x = WALL_SIZE;
            ball.dx = Math.abs(ball.dx);
        } else if (ball.x + ball.width > WIDTH - WALL_SIZE) {
            ball.x = WIDTH - WALL_SIZE - ball.width;
            ball.dx = -Math.abs(ball.dx);
        }

        //проверяем столкновение мяча с верхней стеной
        if (ball.y < WALL_SIZE) {
            ball.y = WALL_SIZE;
            ball.dy = Math.abs(ball.dy);
        }

        //проверяем, не упал ли мяч за нижнюю границу поля
        if (ball.y > HEIGHT) {
            //уменьшаем количество жизней и обновляем его отображение
            lives--;
            livesElement.textContent = lives;
            //если жизни закончились, завершаем игру
            if (lives <= 0) {
                finishGame('game-over.html');
                return;
            }
            //иначе возвращаем мяч на платформу
            resetBall();
        }

        //проверяем столкновение мяча с платформой при движении вниз
        if (ball.dy > 0 && collides(ball, platform)) {
            //убираем пересечение мяча с платформой
            ball.y = platform.y - ball.height;
            //определяем расстояние от центра мяча до центра платформы
            const platformCenter = platform.x + platform.width / 2;
            const ballCenter = ball.x + ball.width / 2;
            const distance = ballCenter - platformCenter;
            const maxDistance = platform.width / 2;
            //рассчитываем угол отскока в зависимости от места попадания
            const angle = (distance / maxDistance) * (Math.PI / 4);
            //новое направление движения мяча
            ball.dx = Math.sin(angle) * ball.speed;
            ball.dy = -Math.cos(angle) * ball.speed;
        }

        //проверяем столкновения мяча с оставшимися блоками
        for (let i = 0; i < bricks.length; i++) {
            const brick = bricks[i];
            //если столкновения нет, переходим к следующему блоку
            if (!collides(ball, brick)) continue;
            //удаляем блок
            brickLayer.removeChild(brick.graphic);
            brick.graphic.destroy();
            bricks.splice(i, 1);
            //прибавляем очки к счету
            score += 10;
            scoreElement.textContent = score;

            //определяем, с какой стороны мяч столкнулся с блоком
            if (
                ball.y + ball.height - Math.abs(ball.dy) <= brick.y ||
                ball.y >= brick.y + brick.height - Math.abs(ball.dy)
            ) {
                //при ударе сверху или снизу меняем вертикальное направление
                ball.dy *= -1;
            } else {
                //при ударе сбоку меняем горизонтальное направление
                ball.dx *= -1;
            }
            //если все блоки уничтожены, завершаем игру победой
            if (bricks.length === 0) {
                finishGame('game-win.html');
                return;
            }

            //за один кадр обрабатываем только одно столкновение с блоком
            break;
        }

        //обновляем положение графики мяча
        ballGraphic.position.set(ball.x, ball.y);
    }
    //завершаем игру и открываем соответствующую страницу
    function finishGame(page) {
        if (gameEnded) return;

        gameEnded = true;
        //останавливаем игровой цикл и отключаем управление
        app.ticker.remove(update);

        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        //сохраняем итоговый счет и переходим на нужную страницу
        localStorage.setItem('score', score);
        window.location.href = page;
    }

    app.ticker.add(update);
}

startGame().catch(error => {
    console.error('Не удалось запустить игру:', error);
});
