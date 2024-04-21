export function gerarHorasPossiveis (){
    const horasPossiveis = [];
    for (let hora = 8; hora <= 23; hora++) {
        for (let minuto = 0; minuto < 60; minuto += 30) {
            const horaFormatada = `${hora < 10 ? '0' : ''}${hora}:${minuto === 0 ? '00' : '30'}:00`;
            horasPossiveis.push(horaFormatada);
        }
    }
    return horasPossiveis;
}


export function isHoraMaisRecente(hora1, hora2) {
    // Dividindo as horas e minutos
    const [hora1Hora, hora1Minuto] = hora1.split(":").map(Number);
    const [hora2Hora, hora2Minuto] = hora2.split(":").map(Number);

    // Verificando se a primeira hora é maior
    if (hora1Hora > hora2Hora) {
        return true;
    } 
    if (hora1Hora === hora2Hora && hora1Minuto > hora2Minuto) {
        return true;
    } 
    return false;
}