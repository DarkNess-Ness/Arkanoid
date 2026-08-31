const canvas = document.getElementById('gameArkan');
const ctx = canvas.getContext('2d');

const level1 = [
    [],
    [],
    [],
    ['grey','grey', 'grey', 'grey', 'grey', 'grey', 'grey', 'grey', 'grey', 'grey', 'grey'],
    ['red','red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'red'],
    ['blue','blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue'],
    ['orange','orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange'],
    ['pink','pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink'],
    ['green','green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'],
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

const brickWidth = 30;
const brickHeight = 15;
const brickGap = 5;
const wallSize = 10;