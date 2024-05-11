// Gerar lista de datas desde o dia from até ao dia to
export function generateDatasFromTo (from, to) {
    const [dayFrom, monthFrom, yearFrom] = from.split('/');
    const [dayTo, monthTo, yearTo] = to.split('/');

    const dateFrom = new Date(`${yearFrom}-${monthFrom}-${dayFrom}`);
    const dateTo = new Date(`${yearTo}-${monthTo}-${dayTo}`);

    let currentTime = dateFrom;
    const datas = [];
    while (currentTime <= dateTo) {
        datas.push(
            `${currentTime.getDate()}/${
                currentTime.getMonth() + 1
            }/${currentTime.getFullYear()}`
        );

        const days = howManyDaysInTheMonth(
            currentTime.getMonth() + 1,
            currentTime.getFullYear()
        );

        if (currentTime.getMonth() === 11 && currentTime.getDate() === days) {
            // console.log(
            // 	'Vou trocar do ano para ',
            // 	currentTime.getFullYear(),
            // 	'para ',
            // 	currentTime.getFullYear() + 1
            // );
            currentTime.setFullYear(currentTime.getFullYear() + 1, 0, 1);
            continue;
        }

        if (currentTime.getDate() === days && currentTime.getMonth() < 11) {
            // console.log(
            // 	'Avancei um Mês de ',
            // 	currentTime.getMonth(),
            // 	'para ',
            // 	currentTime.getMonth() + 1
            // );
            currentTime.setMonth(currentTime.getMonth() + 1, 1);
            continue;
        }

        if (currentTime.getDate() < days) {
            currentTime.setDate(currentTime.getDate() + 1);
            continue;
        }
    }
    return datas;
};

// Dado um mês e um ano retorna o máximo de dias que o mês tem
const howManyDaysInTheMonth = (month, year) => {
    if (month === 2) {
        if (isLeapYear(year)) {
            return 29;
        } else {
            return 28;
        }
    }
    if (month <= 7) {
        if (month % 2 === 0) {
            return 30;
        } else {
            return 31;
        }
    } else {
        if (month % 2 === 0) {
            return 31;
        } else {
            return 30;
        }
    }
};

// Retorna se o ano é bissext
const isLeapYear = (year) => {
    if (year % 400 === 0 && year % 100 === 0) return true;

    if (year % 100 !== 0 && year % 4 === 0) return true;

    return false;
};

export function titleCase(str) {
    var connectors = ["e", "ou", "mas", "se", "porque", "como", "embora", "apesar", "de", "a", "o", "que", "para", "em", "com", "sem", "sob", "sobre", "entre", "dentro", "fora", "até", "através", "durante", "antes", "depois", "acima", "abaixo", "ao", "do", "no", "pelo", "na", "pela", "aos", "dos", "nos", "pelos", "nas", "pelas", "num", "dum", "nuns", "duns", "numa", "duma", "numas", "dumas"];
    
    return str.toLowerCase().split(' ').map(function(word) {
      return connectors.includes(word) ? word : word[0].toUpperCase() + word.slice(1);
    }).join(' ');
  }
  
export function getDayOfTheWeek (day, month, year){
    let t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
    year -= month < 3 ? 1 : 0;

    const result = Math.round(
        (year + year / 4 - year / 100 + year / 400 + t[month - 1] + day) % 7
    );

    switch (result) {
        case 0: {
            return 'Dom';
            break;
        }
        case 1: {
            return 'Seg';
            break;
        }
        case 2: {
            return 'Ter';
            break;
        }
        case 3: {
            return 'Qua';
            break;
        }
        case 4: {
            return 'Qui';
            break;
        }
        case 5: {
            return 'Sex';
            break;
        }
        case 6: {
            return 'Sab';
            break;
        }
    }

    return;
};

export function generateRandomString() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 9; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export function generateTimeSlots(period) {
    let startHour;
    let endHour;

    switch (period) {
        case 'manha':
            startHour = 8;
            endHour = 11;
            break;
        case 'tarde':
            startHour = 13;
            endHour = 16;
            break;
        case 'noite':
            startHour = 18;
            endHour = 21;
            break;
        default:
            return [];
    }

    let timeSlots = [];
    for (let hour = startHour; hour <= endHour; hour += 1.5) {
        let start = Math.floor(hour);
        let startMinutes = (hour - start) * 60;
        let end = Math.floor(hour + 1.5);
        let endMinutes = (hour + 1.5 - end) * 60;

        let startTime = `${start.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`;
        let endTime = `${end.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

        timeSlots.push([startTime, endTime]);
    }

    return timeSlots;
}
