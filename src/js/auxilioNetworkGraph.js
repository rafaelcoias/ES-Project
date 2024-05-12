/**
 * Verifica se o intervalo de tempo definido por range1 está dentro do intervalo de tempo definido por range2.
 * 
 * @param {string} range1Start - A hora de início de range1 no formato 'HH:mm'.
 * @param {string} range1End - A hora de fim de range1 no formato 'HH:mm'.
 * @param {string} range2Start - A hora de início de range2 no formato 'HH:mm'.
 * @param {string} range2End - A hora de fim de range2 no formato 'HH:mm'.
 * @returns {boolean} Verdadeiro se range1 estiver dentro de range2, caso contrário, falso.
 */
export function isTimeRangeInside(range1Start, range1End, range2Start, range2End) {
    // Converte as strings de tempo em objetos Date
    const [r1StartHours, r1StartMinutes] = range1Start.split(':').map(Number);
    const [r1EndHours, r1EndMinutes] = range1End.split(':').map(Number);
    const [r2StartHours, r2StartMinutes] = range2Start.split(':').map(Number);
    const [r2EndHours, r2EndMinutes] = range2End.split(':').map(Number);

    const r1StartDate = new Date();
    r1StartDate.setHours(r1StartHours, r1StartMinutes, 0, 0);

    const r1EndDate = new Date();
    r1EndDate.setHours(r1EndHours, r1EndMinutes, 0, 0);

    const r2StartDate = new Date();
    r2StartDate.setHours(r2StartHours, r2StartMinutes, 0, 0);

    const r2EndDate = new Date();
    r2EndDate.setHours(r2EndHours, r2EndMinutes, 0, 0);

    // Verifica se o intervalo de tempo 1 está dentro do intervalo de tempo 2
    return r2StartDate <= r1StartDate && r1EndDate <= r2EndDate;
}
