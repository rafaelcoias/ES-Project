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
