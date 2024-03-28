export function gerarHorasPossiveis (){
    const horasPossiveis = [];
    for (let hora = 8; hora <= 23; hora++) {
        for (let minuto = 0; minuto < 60; minuto += 30) {
            const horaFormatada = `${hora < 10 ? '0' : ''}${hora}:${minuto === 0 ? '00' : '30'}:00`;
            horasPossiveis.push(horaFormatada);
        }
    }
    return horasPossiveis;
};