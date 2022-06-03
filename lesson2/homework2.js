const {red, green, yellow} = require('colors/safe');
const EventEmitter = require('events');
const eventEmitter = new EventEmitter();


const argsForTimers = process.argv.splice(2); //массив с датами для таймеров
let timers = {}; //тут будут храниться таймеры

const millisecondsToDate = (timestamp)=>{
    const oneSecond = 1000;
    const oneMinute = oneSecond * 60;
    const oneHour = oneMinute * 60;
    const oneDay = oneHour * 24;
    const oneMonth = oneDay * 30; //вот тут я забуксовала в самостоятельной домашке. Я хотела учесть и 30 дней и 31 день и 28 или 29 (високосный год)
    const oneYear = oneMonth * 12;

    //высчитали сколько миллисекунд в году.     //отнимаем годовые миллисекунды из таймстампа (останется кол-во миллисекунд, которых не хватает для одного года)
    const years = Math.floor(timestamp/oneYear); timestamp = timestamp-(years*oneYear); //floor отбрасывает дробную часть (0,9 лет = 0 целых лет)
    const months = Math.floor(timestamp/oneMonth); timestamp -= months*oneMonth;
    const days = Math.floor(timestamp/oneDay); timestamp -= days*oneDay;
    const hours = Math.floor(timestamp/oneHour); timestamp -= hours*oneHour;
    const minutes = Math.floor(timestamp/oneMinute); timestamp -= minutes*oneMinute;
    const seconds = Math.floor(timestamp/oneSecond); timestamp -= seconds*oneSecond;

    //дальше смотрим, если есть хотя бы один год, то говорим сколько ле осталось (так же с месяцами, днями и тд)
    let date = '';
    
    if(years) date += `${years} лет `;
    if(months) date += `${months} месяцев `;
    if(days) date += `${days} дней `;
    if(hours) date += `${hours} часов `;
    if(minutes) date += `${minutes} минут `
    if(seconds) date += `${seconds} секунд `;

    return date;
}



argsForTimers.forEach((timer)=>{
    //console.log(timer); //поочередно выводит все переданные таймеры в формате чч-дд-мм-гггг как строки
    const parseData = timer.split('-'); //теперь это массивы ['чч', 'дд', 'мм', 'гггг']
    //валидация на числа. Метод some() показывает, есть ли в массиве хотя бы один элемент по какому-то условию (хотя бы одно строковое значение)
    const isNumbers = !parseData.some((date)=> !isFinite(+date));
    //проверка на длинну массива в соответствии с форматом (4 элемента в одном аршументе)
    if(parseData.length !== 4 || !isNumbers) console.log(red(timer + ': дата должна быть в числовом формате "ЧЧ-ДД-MM-ГГГГ" '));
    else {
        const timerData = new Date(
            //Date.UTC() - возвращает кол-во мс с 1 января 1970 00:00:00 по UTC. Использует всемирное время.
            Date.UTC(parseData[3], parseData[2]-1, parseData[1], parseData[0])
        ); 
//timerData = 2022-06-03T09:00:00.000Z
        const today = new Date();
        const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds());
//todayUTC = 1654244848000
        const delta = timerData - todayUTC;

        if(delta <= 0) console.log(timer + ': Таймер завершен! Введите таймер больше текушего времени.');
        else {
            //убрать лишнее
            const formatedDate = timerData.toISOString().replace('T', ' ').replace('Z', '').replace('.000', '');
            //в глобальный массив с таймерами внесем текущий таймер, где ключ это отформатированная дата, а дельта - то, что и будет отсчитываться
            timers[formatedDate] = delta;
        }
    }
});

//проверяем, что у нас есть хотя бы один (валидный) таймер:
if(!Object.keys(timers).length) {
    console.log(yellow('\nУкажите хотя бы один валидный таймер в формате "ЧЧ-ДД-ММ-ГГГГ"\n'));
    process.exit(1);
}

//если есть хотя бы один валидный таймер
console.log(yellow(`Успешно запущено ${Object.keys(timers).length} таймеров.`));
Object.keys(timers).map((timer) => console.log(timer));
//console.log(''); 

//далее в сетинтервале каждую секунду берем существующие таймеры и генерируем новые таймеры.
setInterval(()=>{
    const newTimers = {};
    //формируем новый массив с новыми таймерами при проходе по существующим таймерам вычисляя новую дельту.
    Object.keys(timers).map((timer)=>{
        const delta = timers[timer] - 1000; //отнимаем 1 секунду от текущей дельты тацмера, так как каждую секунду запускаем сетинтервал.
        let message = yellow(`Таймер ${timer} исплнен.`); //это будет базовое сообщение об исполнении таймера
        if(delta){ //если дельта больше нуля, то таймер еще не исполнен и переопределяем меседж
            newTimers[timer] = delta;
            message = green(`До исполнения таймера ${timer} осталось ${millisecondsToDate(delta)}`); //функция высчитывает сколько вермени осталось
        }

        eventEmitter.emit('timer', message);
    });

    //проверяем на наличие таймеров, которые еще не исполнены
    if(!Object.keys(newTimers).length){
        console.log(green(`\nВсе таймеры успешно исполнены.`));
        process.exit(0);
    }
    //если таймеры несиполненные еще есть, то просто переписываем глобальные таймеры на новые
    timers = newTimers;
    console.log('');

}, 1000);

eventEmitter.on('timer', console.log); //обработчик события просто выводит в консоь сообщение, которое мы передали в emit()





































/*
let today = new Date();
let todayYear = today.getFullYear();
let todayMonth = today.getMonth()+1;
let todayDay = today.getDate();
let todayHour = today.getHours();

let daysInMonth = (month, year=null)=>{
    switch(month){
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12:
            return 31;
        case 2:
            return ()=>{
                if(year % 4 == 0) return 29;
                return 28;
            };
        default:
            return 30;
    }
}

// const timer1 = process.argv[2].split('-'); //17-30-05-2022 
// const timer2 = process.argv[3].split('-'); //17-30-05-2022
// const timer3 = process.argv[4].split('-'); //18-30-05-2022

class Timer {
    constructor(timer){
        this.year = timer[3],
        this.month = timer[2],
        this.day = timer[1],
        this.hour = timer[0],
        this.isOver = false,
        this.msg = '\n ' + timer.join('-') + '\t осталось: '
    }

    yearsLeft(){
        if(this.year >= todayYear) return this.year - todayYear;
        else { this.isOver = true; return 0;}
    }

    monthsLeft(){
        if(this.isOver) return 0;
        else if(this.year == todayYear && this.month < todayMonth) {this.isOver = true; return 0;}
        else if(this.year > todayYear && this.month < todayMonth) return 12 - todayMonth + this.month;
        else return this.month - todayMonth;
    }

    daysLeft(){
        if(this.isOver) return 0;
        if(this.day < todayDay)
        {
            if(this.month == todayMonth)
            {
                if(this.year == todayYear)
                {
                    this.isOver = true; return 0;
                }
                
                return daysInMonth(this.month, this.year);
            }
        }
    }
}
*/