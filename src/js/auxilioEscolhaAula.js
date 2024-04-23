/**
 * Função para gerar uma lista de horas possíveis em intervalos de 30 minutos.
 *
 * @returns {string[]} Uma lista de horas possíveis no formato "HH:MM:SS".
 */
export function gerarHorasPossiveis() {
    const horasPossiveis = [];
    for (let hora = 8; hora <= 23; hora++) {
        for (let minuto = 0; minuto < 60; minuto += 30) {
            const horaFormatada = `${hora < 10 ? '0' : ''}${hora}:${minuto === 0 ? '00' : '30'}:00`;
            horasPossiveis.push(horaFormatada);
        }
    }
    return horasPossiveis;
}

/**
 * Função para verificar se uma hora é mais recente do que outra.
 *
 * @param {string} hora1 - A primeira hora no formato "HH:MM:SS".
 * @param {string} hora2 - A segunda hora no formato "HH:MM:SS".
 * @returns {boolean} true se hora1 for mais recente do que hora2, caso contrário, false.
 */
export function isHoraMaisRecente(hora1, hora2) {
    // divide as horas e minutos
    const [hora1Hora, hora1Minuto] = hora1.split(":").map(Number);
    const [hora2Hora, hora2Minuto] = hora2.split(":").map(Number);

    // verifica se a primeira hora é maior
    if (hora1Hora > hora2Hora) {
        return true;
    } 
    if (hora1Hora === hora2Hora && hora1Minuto > hora2Minuto) {
        return true;
    } 
    return false;
}
