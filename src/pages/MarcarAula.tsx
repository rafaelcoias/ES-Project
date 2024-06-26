import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
	gerarHorasPossiveis,
	isHoraMaisRecente,
} from '../js/auxilioEscolhaAula';
import { useNavigate } from 'react-router-dom';
import { exportExcel } from '../js/export';

export default function MarcarAula() {
	const navigate = useNavigate();
	//guardar as informações do ficheiro horario
	const [horariosFile, setHorariosFile] = useState<any>(null);
	//guardar nome do ficheiro horario
	const [horariosFileName, setHorariosFileName] = useState<string>('');
	//guardar nome do ficheiro sala
	const [salasFileName, setSalasFileName] = useState<string>('');
	//guardar as informações do ficheiro sala
	const [salaFile, setSalaFile] = useState<any>(null);
	//saber se já fez o upload dos dois ficheiros
	const [uploading, setUploading] = useState<boolean>(false);

	//escolha do curso
	const [uniqueItemsCurso, setUniqueItemsCurso] = useState<any>([]);
	const [selectedItemCurso, setSelectedItemCurso] = useState<any>('');

	//escolha da UC
	const [uniqueItemsUC, setUniqueItemsUC] = useState<any>([]);
	const [selectedItemUC, setSelectedItemUC] = useState<any>('');

	//escolha da Turma
	const [uniqueItemsTurma, setUniqueItemsTurma] = useState<any>([]);
	const [selectedItemTurma, setSelectedItemTurma] = useState<any>(null);

	//escolha hora inicio e fim
	const horas = gerarHorasPossiveis();
	const [selectedItemHoraInicio, setSelectedItemHoraInicio] =
		useState<any>(null);
	const [selectedItemHoraFim, setSelectedItemHoraFim] = useState<any>(null);

	//escolha dia do ano
	const [uniqueItemsDia, setUniqueItemsDia] = useState<any>([]);
	const [selectedItemDia, setSelectedItemDia] = useState<any>(null);

	//escolha dia da semana
	const [uniqueItemsDiaSemana, setUniqueItemsDiaSemana] = useState<any>([]);
	const [selectedItemDiaSemana, setSelectedItemDiaSemana] = useState<any>(null);
	// escolha dia do mes ou dia da semnana
	const [selectedDataAula, setSelectedDataAula] = useState<any>('diaSemana');

	//escolha capacidade
	const [selectedItemCapacidade, setSelectedItemCapacidade] =
		useState<any>(null);

	//escolha sala
	const [uniqueItemsSala, setUniqueItemsSala] = useState<any>([]);
	const [selectedItemSala, setSelectedItemSala] = useState<any>(null);
	//escolha capacidade/sala
	const [selectedCap_Sala, setSelectedCap_Sala] = useState<any>('espaco');

	//Impossibilidades guarda as linhas filtradas do horario para verificar o que vai contra a nossa procura
	// const [impossibilidades, setImpossibilidades] = useState<any>([]);

	// Vai ser populado com o geral das horas e datas menos das horas e datas presentes nas impossibilidades
	const [showPossibiliades, setShowPossibilidades] = useState<any[][]>();
	// const [nomesSalas, setNomesSalas] = useState<any[]>([]);

	const [verPossibilidades, setVerPossibilidades] = useState<boolean>(false);

	const [selectedRows, setSelectedRows] = useState<any[][]>([]);
	const [exportFile, setExportFile] = useState<boolean>(false);

	/**
	 * Função para lidar com a mudança de arquivo de horários.
	 * Converte o arquivo Excel para JSON e define os dados resultantes no estado.
	 *
	 * @param {React.ChangeEvent<HTMLInputElement>} event - O evento de mudança que ocorre quando um arquivo é selecionado.
	 * @returns {void} - Esta função não retorna nenhum valor.
	 */
	const handleHorariosFileChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files ? event.target.files[0] : null;
		if (
			file &&
			(file.name.endsWith('.csv') ||
				file.name.endsWith('.xls') ||
				file.name.endsWith('.xlsx') ||
				file.name.endsWith('.xlsm'))
		) {
			setHorariosFileName(file.name);
			convertExcelToJson(file, setHorariosFile);
		} else {
			alert('Por favor escolha um ficheiro com formato excel.');
		}
	};

	/**
	 * Função para lidar com a mudança de arquivo de sala.
	 * Converte o arquivo Excel para JSON e define os dados resultantes no estado.
	 *
	 * @param {React.ChangeEvent<HTMLInputElement>} event - O evento de mudança que ocorre quando um arquivo é selecionado.
	 * @returns {void} - Esta função não retorna nenhum valor.
	 */
	const handleSalaFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files ? event.target.files[0] : null;
		if (
			file &&
			(file.name.endsWith('.csv') ||
				file.name.endsWith('.xls') ||
				file.name.endsWith('.xlsx') ||
				file.name.endsWith('.xlsm'))
		) {
			setSalasFileName(file.name);
			convertExcelToJson(file, setSalaFile);
		} else {
			alert('Por favor escolha um ficheiro com formato excel.');
		}
	};

	/**
	 * Função para converter um arquivo Excel em JSON.
	 *
	 * @param {any} file - O arquivo Excel a ser convertido.
	 * @param {React.Dispatch<React.SetStateAction<any[]>>} setDataCallback - O callback para definir os dados resultantes no estado.
	 * @returns {void} - Esta função não retorna nenhum valor.
	 */
	const convertExcelToJson = (
		file: any,
		setDataCallback: React.Dispatch<React.SetStateAction<any[]>>
	) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const arrayBuffer = e.target?.result as ArrayBuffer;
			const data = new Uint8Array(arrayBuffer);
			const workbook = XLSX.read(data, { type: 'array' });
			const firstSheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[firstSheetName];
			const jsonData = XLSX.utils.sheet_to_json(worksheet, {
				header: 1,
				defval: '',
			});
			setDataCallback(jsonData);
		};
		reader.readAsArrayBuffer(file);
	};

	// Criar rows com intervalos de meia hora para os parametros dados
	const generateRows = (
		sala: string,
		date: string,
		start: string,
		end: string
	) => {
		const rows: any[][] = [];
		const [day, month, year] = date.split('/');
		const [hourStart, minuteStart, secondStart] = start.split(':');
		const [hourEnd, minuteEnd, secondEnd] = end.split(':');
		const isoDate = `${year}-${month}-${day}`;

		let currentTime = new Date(isoDate);
		currentTime.setHours(
			Number(hourStart),
			(Number(minuteStart), Number(secondStart))
		);

		const endDate = new Date(isoDate);
		endDate.setHours(Number(hourEnd), (Number(minuteEnd), Number(secondEnd)));

		while (currentTime < endDate) {
			const startTime = currentTime.toTimeString().slice(0, 8);
			currentTime.setMinutes(currentTime.getMinutes() + 30);
			const endTime = currentTime.toTimeString().slice(0, 8);
			const weekDay = getDayOfTheWeek(Number(day), Number(month), Number(year));
			const value = [sala, date, weekDay, startTime, endTime];
			rows.push(value);
		}
		return rows;
	};

	/**
	 * Função para lidar com o botão de continuar.
	 * Realiza algumas verificações e atualiza o estado com base nos arquivos de horários e sala selecionados.
	 *
	 * @returns {void} - Esta função não retorna nenhum valor.
	 */
	const handleContinuar = () => {
		if (horariosFile && salaFile) {
			setUploading(true);
			const columnData: any[] = horariosFile.flatMap((row: any) => {
				// Faz o split por vírgula em cada string dentro de row[0]
				return row[2];
			});
			if (Array.isArray(columnData)) {
				const uniqueItems = Array.from(new Set(columnData)).sort((a, b) =>
					a.localeCompare(b)
				);
				setUniqueItemsCurso(uniqueItems);
				setSelectedItemCurso(uniqueItems[0]); // Seleciona o primeiro item
			} else {
				alert('Erro ao processar os dados do arquivo de horários.');
			}
		} else {
			alert('Por favor preencha todos os campos');
		}
	};

	// Gerar lista de datas desde o dia from até ao dia to
	const generateDatasFromTo = (from: string, to: string) => {
		const [dayFrom, monthFrom, yearFrom] = from.split('/');
		const [dayTo, monthTo, yearTo] = to.split('/');

		const dateFrom = new Date(`${yearFrom}-${monthFrom}-${dayFrom}`);
		const dateTo = new Date(`${yearTo}-${monthTo}-${dayTo}`);

		let currentTime = dateFrom;
		const datas:any = [];
		while (currentTime <= dateTo) {
			datas.push(
				`${currentTime.getDate()}/${currentTime.getMonth() + 1
				}/${currentTime.getFullYear()}`
			);

			const days = howManyDaysInTheMonth(
				currentTime.getMonth() + 1,
				currentTime.getFullYear()
			);

			if (currentTime.getMonth() === 11 && currentTime.getDate() === days) {
				currentTime.setFullYear(currentTime.getFullYear() + 1, 0, 1);
				continue;
			}

			if (currentTime.getDate() === days && currentTime.getMonth() < 11) {
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
	const howManyDaysInTheMonth = (month: number, year: number) => {
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
	const isLeapYear = (year: number) => {
		if (year % 400 === 0 && year % 100 === 0) return true;

		if (year % 100 !== 0 && year % 4 === 0) return true;

		return false;
	};

	// Retorna o dia da semana referente a uma data
	const getDayOfTheWeek = (day: number, month: number, year: number) => {
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

	// Função usada para o toggle da seleção de linhas das possibilidades
	const toggleRowSelection = (clickedRow: any) => {
		// Procurar a linha atual na lista de selecionadas
		const index = selectedRows.findIndex((row) => row === clickedRow);
		if (index !== -1) {
			// Caso o index seja diferente de -1, significa que a linha esta na lista de selecionadas
			// E retiramos
			setSelectedRows((prevRows) => prevRows.filter((_, i) => i !== index));
		} else {
			// Caso o index for -1, significa que a linha nao esta na lista de selecionadas
			// E adicionamos
			setSelectedRows((prevRows) => [...prevRows, clickedRow]);
		}
		if (exportFile) {
			setExportFile(false);
		}
	};

	// Função que corre quando se clica no botão de marcar as aulas
	const handleMarcarAula = () => {
		// Se as rows selecionadas forem 0 não faz nada
		if (selectedRows.length === 0) {
			alert('Não estão selecionadas linhas da tabela');
		} else {
			// Ao clicar no botão aparece o botão para exportare
			setExportFile(true);
		}
	};

	// Converte as rows de possiblidades em rows com os mesmos parâmetros do ficheiro dos horarios
	const convertSelectedRowsIntoHorariosFile = () => {
		// Primeiro converter rows consecutivas em uma única linha. (8:00 -> 8:30 e 8:30 -> 9:00 para 8:00 -> 9:00)
		const mergedRows = mergeSelectedRows();

		// Transformar o formato de 5 colunas para as 13 da
		let newRows = mergedRows.map((row: any) => {
			return [
				'',
				'',
				selectedItemCurso,
				selectedItemUC,
				'',
				selectedItemTurma,
				'',
				row[2],
				row[3],
				row[4],
				row[1],
				selectedItemSala.split(';')[1],
				row[0],
			];
		});

		return newRows;
	};

	// Funde as linhas selecionadas em uma só caso sejam consecutivas
	const mergeSelectedRows = () => {
		// TODO - A pessoa se a pessoa quiser marcar aulas com multiplos blocos de meia hora deve selecionar as linhas coonsecutivamente de cima para baixo para criar um unico bloco no ficheiroo dos horarios.

		// Se consecutiveRows estiver vazio meto o primeiro elemento das selecionadas lá.
		// Se o ultimo elemento das conscutive rows tiver o (mesma data, mesma sala) tempo final igual ao tempo inicial da selectedRow atual a selected row atual vai ser colocada no final da consecutiveRows.
		// Caso não sejam consecutivas, se consecutive rows tiver dados eles são fundidos vão para o resultRows, e a selected row atual vai para o consecutive rows.

		let consecutiveRows: any[] = [];
		let resultRows: any[] = [];

		for (let i = 0; i < selectedRows.length; i++) {
			// Se consecutive rows não tiver dados
			if (consecutiveRows.length === 0) {
				consecutiveRows.push(selectedRows[i]);
				continue;
			}

			// Se tiver dados vamos buscar o ultimo elemento
			const lastConsecutiveElement =
				consecutiveRows[consecutiveRows.length - 1];

			// Se o ultimo elemento da consecutive é "igual" (condições necessárias = true) à selected row atual então a selected row vai para consecutive rows
			if (
				lastConsecutiveElement[0] === selectedRows[i][0] &&
				lastConsecutiveElement[1] === selectedRows[i][1] &&
				lastConsecutiveElement[4] === selectedRows[i][3]
			) {
				consecutiveRows.push(selectedRows[i]);
				continue;
			} else {
				// Caso o ultimo elemento da consecutive não seja "igual" (condições necessárias = true) à selected row atual então SE consecutive rows tiverem mais do que uma linha, estas são merged e SE NÃO, a selected row vai para o retorno e a selected row atual vai para o consecutive rows
				if (consecutiveRows.length > 1) {
					const newRow = [
						consecutiveRows[0][0],
						consecutiveRows[0][1],
						consecutiveRows[0][2],
						consecutiveRows[0][3],
						consecutiveRows[consecutiveRows.length - 1][4],
					];

					resultRows.push(newRow);
					consecutiveRows = [selectedRows[i]];
				} else {
					resultRows.push(consecutiveRows[0]);
					consecutiveRows = [selectedRows[i]];
				}
			}
		}
		if (consecutiveRows.length > 1) {
			const newRow = [
				consecutiveRows[0][0],
				consecutiveRows[0][1],
				consecutiveRows[0][2],
				consecutiveRows[0][3],
				consecutiveRows[consecutiveRows.length - 1][4],
			];

			resultRows.push(newRow);
		} else if (consecutiveRows.length === 1) {
			resultRows.push(consecutiveRows[0]);
		}

		return resultRows;
	};

	const handleExportFile = () => {
		// Adiciona as linhas selecionadas( e convertidas) para o arquivo de horários
		const rows = convertSelectedRowsIntoHorariosFile();
		const newHorarios = horariosFile.concat(rows);
		// setHorariosFile(horariosFile.concat(rows));
		exportExcel(newHorarios, 'HorariosAulas.csv');
	};

	//Função de efeito para mostrar as unidades curriculares com base no arquivo de horários selecionado.
	//Atualiza o estado com as unidades curriculares únicas.
	useEffect(() => {
		const mostrarUC = () => {
			if (horariosFile) {
				const filteredData: any[] = horariosFile.filter(
					(row: any) => row[2] === selectedItemCurso
				);
				const columnData: any[] = filteredData.map((row: any) => row[3]);
				if (Array.isArray(columnData)) {
					const uniqueItems = Array.from(new Set(columnData));
					setUniqueItemsUC(uniqueItems);
					setSelectedItemUC(uniqueItems[0]); // Seleciona o primeiro item
				} else {
					alert('Erro ao processar o  s dados do arquivo de horários.');
				}
			}
		};

		mostrarUC();
	}, [selectedItemCurso, horariosFile, selectedItemUC]);

	//Atualiza a lista de turmas com base nos arquivos de horários e salas selecionados,
	//bem como nas unidades curriculares e curso selecionados
	useEffect(() => {
		const mostrarTurmas = () => {
			if (horariosFile && salaFile && selectedItemUC && selectedItemCurso) {
				const filteredDataUC: any[] = horariosFile.filter((row: any) =>
					row[3].includes(selectedItemUC)
				);
				const filteredDataCurso: any[] = filteredDataUC.filter((row: any) =>
					row[2].includes(selectedItemCurso)
				);
				const columnData: any[] = filteredDataCurso.map((row: any) => row[5]);
				if (Array.isArray(columnData)) {
					const uniqueItems = Array.from(new Set(columnData));
					setUniqueItemsTurma(uniqueItems);
					setSelectedItemTurma(uniqueItems[0]); // Seleciona o primeiro item
				} else {
					alert('Erro ao processar os dados do arquivo de horários.');
				}
			}
		};
		mostrarTurmas();
	}, [selectedItemUC, selectedItemCurso, horariosFile, salaFile]);

	//Atualiza a lista de dias disponíveis com base nos arquivos de horários, salas e turmas selecionados,
	//bem como nas unidades curriculares e curso selecionados

	useEffect(() => {
		const mostrarDia = () => {
			if (
				horariosFile &&
				salaFile &&
				selectedItemUC &&
				selectedItemCurso &&
				selectedItemTurma
			) {
				const columnData: any[] = generateDatasFromTo(
					'01/01/2022',
					'31/12/2024'
				);
				if (Array.isArray(columnData)) {
					const uniqueItems = Array.from(new Set(columnData)).sort((a, b) => {
						if (typeof a !== 'string' || typeof b !== 'string') {
							return 0;
						}
						const [dayA, monthA, yearA] = a.split('/');
						const [dayB, monthB, yearB] = b.split('/');
						const dateA = new Date(`${yearA}-${monthA}-${dayA}`);
						const dateB = new Date(`${yearB}-${monthB}-${dayB}`);
						const result = dateA <= dateB;
						if (result) {
							return -1;
						} else {
							return 1;
						}
					});
					setUniqueItemsDia(uniqueItems);
					setSelectedItemDia(uniqueItems[0]); // Seleciona o primeiro item
				}
			}
		};
		mostrarDia();
	}, [
		selectedItemUC,
		selectedItemCurso,
		selectedItemTurma,
		salaFile,
		horariosFile,
	]);

	//Atualiza a lista de dias da semana disponíveis com base nos arquivos de horários, salas e turmas selecionados,
	//bem como nas unidades curriculares e curso selecionados.
	useEffect(() => {
		const mostrarDiaSemana = () => {
			if (
				horariosFile &&
				salaFile &&
				selectedItemUC &&
				selectedItemCurso &&
				selectedItemTurma
			) {
				setUniqueItemsDiaSemana([
					'Dom',
					'Seg',
					'Ter',
					'Qua',
					'Qui',
					'Sex',
					'Sab',
				]);

				setSelectedItemDiaSemana('Dia da Semana'); // Seleciona o primeiro item
			}
		};
		mostrarDiaSemana();
	}, [
		selectedItemUC,
		selectedItemCurso,
		selectedItemTurma,
		salaFile,
		horariosFile,
	]);

	//Atualiza a lista de salas disponíveis com base nos arquivos de horários, salas e turmas selecionados,
	//bem como nas unidades curriculares e curso selecionados.
	useEffect(() => {
		const mostrarSala = () => {
			if (
				horariosFile &&
				salaFile &&
				selectedItemUC &&
				selectedItemCurso &&
				selectedItemTurma
			) {
				const headerRow = salaFile[0]; // Linha do cabeçalho
				// slice(1) retorna o array sem a primeira linha
				const columnData: any[] = salaFile.slice(1).map((row: any) => {
					let salaWithName: string = row[3]; // Nome inicial da sala
					for (let i = 7; i < row.length; i++) {
						if (row[i] === 'X') {
							salaWithName += ';' + headerRow[i]; // Adiciona o nome da coluna se houver 'X'
						}
					}
					return salaWithName;
				});
				if (Array.isArray(columnData)) {
					const soNome = columnData.map(
						(row: any) => row.toString().split(';')[0]
					);
					const uniqueItems = Array.from(new Set(soNome));
					setUniqueItemsSala(uniqueItems);
					setSelectedItemSala(uniqueItems[0]); // Seleciona o primeiro item
				}
			}
		};
		mostrarSala();
	}, [
		selectedItemTurma,
		horariosFile,
		selectedItemCurso,
		salaFile,
		selectedItemUC,
	]);

	//Executa a verificação de possibilidades quando o estado 'verPossibilidades' é alterado.
	//Verifica se todos os campos necessários estão preenchidos corretamente.
	useEffect(() => {
		let impossibilidades: any[][] = [];
		let nomesSalas: any[] = [];
		let possibilidades: any[][] = [
			['Sala', 'Dia', 'DiaSemana', 'Hora Inicio', 'Hora Fim'],
		];

		if (verPossibilidades) {
			const handleVerPossibilidades = () => {
				// Verificar se os campos estão preenchidos corretamente

				if (!selectedItemHoraInicio || !selectedItemHoraFim) {
					alert(
						"Por favor preencha todos os campos 'Hora Inicio' e 'Hora Fim'."
					);
					return; // Sai da função se algum dos campos estiver vazio
				}

				// Verifica se as horas foram preenchidas corretamente antes de usar a função isHoraMaisRecente
				const horaInicio =
					selectedItemHoraInicio === 'Hora Inicio'
						? null
						: selectedItemHoraInicio;
				const horaFim =
					selectedItemHoraFim === 'Hora Fim' ? null : selectedItemHoraFim;

				if (!horaInicio || !horaFim) {
					alert(
						"Por favor preencha todos os campos 'Hora Inicio' e 'Hora Fim'."
					);
					return; // Sai da função se algum dos campos estiver com valor incorreto
				}

				// Verifica se se a hora de início é mais antiga que a hora de fim
				if (!isHoraMaisRecente(horaFim, horaInicio)) {
					alert("A 'Hora Inicio' tem que ser mais antiga que a 'Hora Fim'!");
				}

				// Verifica se foi selecionado um dia da semana
				const diaSemana =
					selectedDataAula === 'diaSemana' ? selectedItemDiaSemana : null;
				if (selectedDataAula === 'diaSemana') {
					if (diaSemana === 'Dia da semana') alert('Escolha um dia da semana!');
				}

				// Verifica se foi selecionado um dia do ano
				const diaAno = selectedDataAula === 'diaAno' ? selectedItemDia : null;
				if (selectedDataAula === 'diaAno') {
					if (diaAno === 'Data da aula') alert('Escolha um dia da ano!');
				}

				// Verifica se foi selecionado um tipo de sala

				const espaco = selectedCap_Sala === 'espaco' ? selectedItemSala : null;
				if (selectedCap_Sala === 'espaco') {
					if (espaco === 'Tipo de Sala') alert('Escolha o Tipo de sala!');
				}

				//Verifica se a capacidade selecionada é maior que 0
				const capacidade =
					selectedCap_Sala === 'capacidade'
						? parseInt(selectedItemCapacidade)
						: null;

				if (selectedCap_Sala === 'capacidade') {
					if (capacidade === 0) alert('A capacidade tem de ser maior que 0');
				}

				// Começa a verificação das impossibilidades
				// O plano é primeiro ir descobrir que salas podemos usar (no caso da capacidade) e depois ir aos horarios pesquisar quais os horarios já preenchidos para estas salas para estas salas.
				// Para cada sala que encontramos, populamos o array das possibilidades para o Curso, UC, Data, hora inicio e hora fim.
				// Depois vou a este array das possbilidades e para cada sala, para cada data com horas preenchidas vamos removendo essas linhas do array.

				// Horas das aulas 08:00:00 até 22:30:00

				if (capacidade) {
					// Ir ao ficheiro das salas procurar sala com capacidade maior ou igual à necessária
					const salas = salaFile
						.slice(1)
						.filter((row: any) => row[4] >= capacidade);

					// Transformar o resultado da pesquisa num array
					const salasNomes = salas.map((row: any) => {
						return row[3];
					});

					nomesSalas = salasNomes;
					// Ir ao ficheiro dos horários procurar horários com sala igual às salas encontradas no array salasNomes
					const rooms = horariosFile.slice(1).filter((row: any) =>
						salasNomes.some((sala: any) => {
							if (typeof row[12] === 'string') {
								return sala === row[12];
							}
							return false;
						})
					);

					if (rooms.length > 0) {
						impossibilidades = rooms;
					}
				} else if (espaco) {
					const rooms = horariosFile.filter((row: any) => espaco === row[12]);

					nomesSalas.push(espaco);
					impossibilidades = rooms;
				}

				if (diaAno && horaInicio && horaFim) {

					// Ir ao ficheiro das impossibilidades procurar marcações para as salas selecionadas no dia selecionado
					if (impossibilidades.length > 0) {
						const roomsWithDia = impossibilidades.filter((row: any) => {

							return selectedItemDia === row[10];
						});
						impossibilidades = roomsWithDia;
					}

					let rowsToConcat: any[][] = [];
					nomesSalas.map((sala: any) => {
						const rows = generateRows(
							sala,
							selectedItemDia,
							selectedItemHoraInicio,
							selectedItemHoraFim
						);
						rowsToConcat = rowsToConcat.concat(rows);
					});

					possibilidades = possibilidades.concat(rowsToConcat);
				} else if (diaSemana && horaInicio && horaFim) {

					// Todas as datas que são o dia da semana selecionado
					const datesByDayOfTheWeek = uniqueItemsDia.filter((data: any) => {
						const [day, month, year] = data.split('/');
						const dayOfTheWeek = getDayOfTheWeek(
							Number(day),
							Number(month),
							Number(year)
						);
						return dayOfTheWeek === selectedItemDiaSemana;
					});

					let rooms: any[][] = [];
					if (impossibilidades.length > 0) {
						nomesSalas.map((sala: any) => {
							const filtro = impossibilidades.filter((row: any) => {
								return row[12] === sala;
							});
							rooms = rooms.concat(filtro);
						});
						impossibilidades = rooms;
					}

					let rowsToConcat: any[][] = [];
					nomesSalas.map((sala: any) => {
						datesByDayOfTheWeek.map((data: any) => {
							const rows = generateRows(
								sala,
								data,
								selectedItemHoraInicio,
								selectedItemHoraFim
							);
							rowsToConcat = rowsToConcat.concat(rows);
						});
					});

					possibilidades = possibilidades.concat(rowsToConcat);
				}

				// Depois de termos todos os registos do ficheiro dos horarios para as salas que escolhemos, como para as datas falta comparar as possibilidades, com as impossibilidades

				// Para o nosso ficheiro de possibilidades temos de retirar aquelas que venham contra o que queiramos

				if (impossibilidades.length > 0) {
					impossibilidades.map((impRow: any) => {
						const fileHoraInicio = impRow[8].split(':');
						const fileHoraFim = impRow[9].split(':');

						const fileStart = new Date();
						fileStart.setHours(
							Number(fileHoraInicio[0]),
							Number(fileHoraInicio[1]),
							Number(fileHoraInicio[2])
						);

						const fileEnd = new Date();
						fileEnd.setHours(
							Number(fileHoraFim[0]),
							Number(fileHoraFim[1]),
							Number(fileHoraFim[2])
						);

						const newPoss = possibilidades.slice(1).filter((possRow: any) => {
							const [horaStart, minutoStart, segundoStart] =
								possRow[3].split(':');
							const [horaEnd, minutoEnd, segundoEnd] = possRow[4].split(':');
							const start = new Date();
							start.setHours(
								Number(horaStart),
								Number(minutoStart),
								Number(segundoStart)
							);

							const end = new Date();
							end.setHours(
								Number(horaEnd),
								Number(minutoEnd),
								Number(segundoEnd)
							);

							return !(
								possRow[1] === impRow[10] &&
								((fileStart >= start && fileStart <= end) ||
									(fileEnd >= start && fileEnd <= end) ||
									(fileStart <= start && fileEnd >= end))
							);
						});
						possibilidades = [possibilidades[0], ...newPoss];
					});
				}
				setShowPossibilidades(possibilidades);
			};

			handleVerPossibilidades();
		}
	}, [verPossibilidades]);

	//////////////////////////////PAGINA HTML/////////////////////////////////

	if (!uploading) {
		return (
			<div className='flex flex-col items-center justify-center'>
				<div className='absolute top-8 left-[4vw] font-mybold text-black'>
					<button
						onClick={() => navigate(-1)}
						className='absolute top-8 left-[4vw] font-mybold text-black'
					>
						{' '}
						⬅VOLTAR
					</button>
				</div>

				<div className='mt-[300px] flex justify-center items-center flex-col'>
					<div className='flex gap-4'>
						<div className='flex flex-col gap-4 border-2 border-black p-8 rounded-[30px]'>
							<p className='text-lg font-bold text-center'>
								<span className='text-black'>+</span> Upload de Horários
							</p>
							{!horariosFile ? (
								<input
									type='file'
									id='horarios'
									accept='.csv,.xlsx'
									onChange={handleHorariosFileChange}
									className='text-lg'
								/>
							) : (
								<div className='flex items-center'>
									<div>{horariosFileName}</div>
									<button
										onClick={() => setHorariosFile(null)}
										className='ml-5 px-2 py-1 bg-[var(--blue)] text-white rounded-md hover:bg-white hover:text-[var(--blue)] transition-all duration-300'
									>
										↺
									</button>
								</div>
							)}
						</div>

						<div className='flex flex-col gap-4 border-2 border-black p-8 rounded-[30px]'>
							<p className='text-lg font-bold text-center'>
								<span className='text-black'>+</span> Upload de Sala
							</p>
							{!salaFile ? (
								<input
									type='file'
									id='sala'
									accept='.csv,.xlsx'
									onChange={handleSalaFileChange}
									className='text-lg'
								/>
							) : (
								<div className='flex items-center'>
									<div>{salasFileName}</div>
									<button
										onClick={() => setSalaFile(null)}
										className='ml-5 px-2 py-1 bg-[var(--blue)] text-white rounded-md hover:bg-white hover:text-[var(--blue)] transition-all duration-300'
									>
										↺
									</button>
								</div>
							)}
						</div>
					</div>
				</div>

				<button
					className='mt-20 px-10 py-3 bg-[var(--blue)] text-white rounded-[13px] hover:bg-[var(--white)] hover:text-[var(--blue)] hover:border-[var(--blue)] border border-transparent transition-all duration-300'
					onClick={handleContinuar}
				>
					Continuar
				</button>
			</div>
		);
	}


	return (
		<div className="w-full min-h-screen py-[5rem] px-[8vw] flex flex-col">

			<div className='absolute text-black top-8 left-4 font-mybold'>
				<button
					onClick={() => navigate(-1)}
					className='absolute top-8 left-[4vw] font-mybold text-black'
				>
					{' '}
					⬅VOLTAR
				</button>
			</div>

			<div className="flex flex-col items-center min-h-screen gap-8">
				<h1 className="text-[1.5rem] quatro:text-[2rem] font-bold text-[var(--blue)]">
					Marcar Aula
				</h1>

				<div className='w-[800px] border-2 border-black p-8 rounded-3xl'>
					<div className='flex justify-between mb-4'>
						<label htmlFor='selectedItemCurso'>Selecione um curso:</label>
						<select
							className='w-[320px] select-text'
							id='selectedItemCurso'
							value={selectedItemCurso || ''}
							onChange={(e) => {
								setSelectedItemCurso(e.target.value);
							}}
						>
							{uniqueItemsCurso.map((item: string, index: number) => (
								<option key={index} value={item}>
									{item}
								</option>
							))}
						</select>
					</div>

					<div className='flex justify-between mb-4'>
						<label htmlFor='selectedItemUC'>Selecione uma UC:</label>
						{selectedItemCurso !== 'Curso' ? (
							<select
								className='w-[320px] select-text'
								id='selectedItemUC'
								value={selectedItemUC || ''}
								onChange={(e) => {
									setSelectedItemUC(e.target.value);
								}}
							>
								{uniqueItemsUC.map((item: string, index: number) => (
									<option key={index} value={item}>
										{item}
									</option>
								))}
							</select>
						) : (
							<div></div>
						)}
					</div>

					<div className='flex justify-between mb-4'>
						<label htmlFor='selectedItemTurma'>Selecione as Turmas:</label>
						{selectedItemCurso !== 'Curso' && selectedItemTurma !== null ? (
							<select
								className='w-[320px] select-text'
								id='selectedItemTurma'
								value={selectedItemTurma || ''}
								onChange={(e) => setSelectedItemTurma(e.target.value)}
							>
								{uniqueItemsTurma.map((item: string, index: number) => (
									<option key={index} value={item}>
										{item}
									</option>
								))}
							</select>
						) : (
							<div></div>
						)}
					</div>

					<hr className='ml-4 w-[95%] border-gray-400 my-6' />

					<div className='flex justify-between mb-4'>
						<div className='flex flex-row ml-10'>
							<label htmlFor='selectedItemHoraInicio'>Hora Inicio:</label>
							{selectedItemCurso !== 'Curso' &&
								selectedItemTurma !== null &&
								selectedItemTurma !== null ? (
								<select
									className='ml-10 mr-10 w-[150px] select-text'
									id='selectedItemHoraInicio'
									value={selectedItemHoraInicio || ''}
									onChange={(e) => setSelectedItemHoraInicio(e.target.value)}
								>
									<option value='Hora Inicio'>Hora Inicio</option>
									{horas.map((item: string, index: number) => (
										<option key={index} value={item}>
											{item}
										</option>
									))}
								</select>
							) : (
								<div></div>
							)}
						</div>
						<div className='flex flex-row'>
							<label htmlFor='selectedItemHoraFim'>Hora Fim:</label>
							{selectedItemCurso !== 'Curso' &&
								selectedItemTurma !== null &&
								selectedItemTurma !== null ? (
								<select
									className='ml-10 mr-10 w-[150px] select-text'
									id='selectedItemHoraFim'
									value={selectedItemHoraFim || ''}
									onChange={(e) => setSelectedItemHoraFim(e.target.value)}
								>
									<option value='Hora Fim'>Hora Fim</option>
									{horas.map((item: string, index: number) => (
										<option key={index} value={item}>
											{item}
										</option>
									))}
								</select>
							) : (
								<div></div>
							)}
						</div>
					</div>

					<hr className='ml-4 w-[95%] border-gray-400 my-6' />

					<div className='flex justify-between mb-4'>
						<label htmlFor='optionData'>Escolha uma opção de data:</label>
						<select
							className='w-[320px] select-text'
							id='optionData'
							value={selectedDataAula || ''}
							onChange={(e) => setSelectedDataAula(e.target.value)}
						>
							<option value='diaSemana'>Dia da Semana</option>
							<option value='diaAno'>Data da aula</option>
						</select>
					</div>
					<div className='flex justify-between mb-4'>
						{selectedDataAula === 'diaAno' ? (
							<>
								<label htmlFor='selectedItemDia'>Data da aula:</label>
								<select
									className='w-[320px] select-text'
									id='selectedItemDia'
									value={selectedItemDia || ''}
									onChange={(e) => {
										setSelectedItemDia(e.target.value);
										setSelectedItemDiaSemana('diaSemana');
									}}
								>
									{uniqueItemsDia.map((item: string, index: number) => (
										<option key={index} value={item}>
											{item}
										</option>
									))}
								</select>
							</>
						) : (
							<>
								<label htmlFor='selectedItemDiaSemana'>Dia da Semana:</label>
								<select
									className='w-[320px] select-text'
									id='selectedItemDiaSemana'
									value={selectedItemDiaSemana || ''}
									onChange={(e) => {
										setSelectedItemDiaSemana(e.target.value);
										setSelectedItemDia(uniqueItemsDia[0]);
									}}
								>
									{uniqueItemsDiaSemana.map((item: string, index: number) => (
										<option key={index} value={item}>
											{item}
										</option>
									))}
								</select>
							</>
						)}
					</div>

					<hr className='ml-4 w-[95%] border-gray-400 my-6' />

					<div className='flex justify-between mb-4'>
						<label htmlFor='optionCap_Sala'>
							Escolha um espaço/capacidade:
						</label>
						<select
							className='w-[320px] select-text'
							id='optionCap_Sala'
							value={selectedCap_Sala || ''}
							onChange={(e) => {
								setSelectedCap_Sala(e.target.value);
								selectedCap_Sala === 'capacidade'
									? setSelectedItemCapacidade(0)
									: setSelectedItemSala(uniqueItemsSala[0]);
							}}
						>
							<option value='espaco'>Espaço</option>
							<option value='capacidade'>Capacidade</option>
						</select>
					</div>
					<div className='flex justify-between mb-4'>
						{selectedCap_Sala === 'capacidade' ? (
							<>
								<label htmlFor='selectedItemCapacidade'>Capacidade:</label>
								<input
									className='w-[320px] select-text border border-black rounded-md pl-2 text-right'
									type='number'
									id='selectedItemCapacidade'
									value={selectedItemCapacidade || 0}
									min='0'
									onChange={(e) => {
										setSelectedItemCapacidade(e.target.value);
										setSelectedItemSala('Tipo de Sala');
									}}
								/>
							</>
						) : (
							<>
								<label htmlFor='selectedItemSala'>Espaco:</label>
								<select
									className='w-[320px] select-text'
									id='selectedItemSala'
									value={selectedItemSala || ''}
									onChange={(e) => {
										setSelectedItemSala(e.target.value);
										setSelectedItemCapacidade(0);
									}}
								>
									<option value='Tipo de Sala'>Tipo de Sala</option>
									{uniqueItemsSala.map((item: string, index: number) => (
										<option key={index} value={item}>
											{item}
										</option>
									))}
								</select>
							</>
						)}
					</div>
				</div>

				<div className='flex justify-center col-span-3'>
					<button onClick={() => setVerPossibilidades(!verPossibilidades)} className='px-8 py-3 bg-[var(--blue)] text-white rounded-[13px] hover:bg-[var(--white)] hover:text-[var(--blue)] hover:border-[var(--blue)] border border-transparent transition-all duration-300'>
						Ver Possibilidades
					</button>
				</div>

				<div style={{ display: showPossibiliades ? 'block' : 'none' }} className='flex justify-center'>
					<p> Selecione as linhas consecutivamente para criar um bloco de aulas. Pode selecionar multiplos blocos de linhas.</p>
				</div>

				<div style={{ display: showPossibiliades ? 'block' : 'none' }} className='w-full overflow-x-auto mb-[2rem] h-[35rem] bg-white'>

					{showPossibiliades && showPossibiliades.length > 1 ? (
						<table className='w-full text-left text-[.8rem] text-black'>
							<thead>
								<tr className='uppercase bg-white'>
									{showPossibiliades &&
										showPossibiliades[0] &&
										showPossibiliades[0].map((value: any, index: number) => (
											<th key={index} className='sticky top-0'>
												<div className='border-[1px] border-black p-2 min-w-[10rem] bg-[white]'>
													<p className='whitespace-nowrap'>{value}</p>
												</div>
											</th>
										))}
								</tr>
							</thead>
							{/* Body/informação da tabela */}
							<tbody>
								{showPossibiliades && showPossibiliades.length > 0 ? (
									showPossibiliades.slice(1).map((row: any, rowIndex: number) =>
										selectedRows.includes(row) ? (
											<tr
												key={rowIndex}
												onClick={() => toggleRowSelection(row)}
												className={`cursor-pointer bg-blue-600`}
											>
												{/* Caso contrário, renderize os valores normais da linha*/}
												{row.map((value: any, colIndex: number) => (
													<td
														key={colIndex}
														className='p-2 border-[1px] border-black whitespace-nowrap'
													>
														{value}
													</td>
												))}
												{/* Adicione o botão de edição na última coluna */}
											</tr>
										) : (
											<tr
												key={rowIndex}
												onClick={() => toggleRowSelection(row)}
												className={`hover:bg-[#d8d8d8] cursor-pointer ${rowIndex % 2 === 0 && 'bg-[#eeeeee]'
													}`}
											>
												{/* Caso contrário, renderize os valores normais da linha*/}
												{row.map((value: any, colIndex: number) => (
													<td
														key={colIndex}
														className='p-2 border-[1px] border-black whitespace-nowrap'
													>
														{value}
													</td>
												))}
												{/* Adicione o botão de edição na última coluna */}
											</tr>
										)
									)
								) : (
									<tr className='absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]'>
										<td
											colSpan={Object.keys(showPossibiliades[0]).length + 1}
											className='text-center text-[1.2rem]'
										>
											Sem resultados
										</td>
									</tr>
								)}
							</tbody>
						</table>
					) : null}
				</div>

				<div style={{ display: showPossibiliades ? 'block' : 'none' }}>
					<button
						onClick={() => handleMarcarAula()}
						className='px-8 py-3 bg-[var(--blue)] text-white rounded-[13px] hover:bg-[var(--white)] hover:text-[var(--blue)] hover:border-[var(--blue)] border border-transparent transition-all duration-300'
					>
						Marcar aula
					</button>
					{exportFile ? (
						<button
							onClick={() => handleExportFile()}
							className='ml-10 px-8 py-3 bg-[var(--blue)] text-white rounded-[13px] hover:bg-[var(--white)] hover:text-[var(--blue)] hover:border-[var(--blue)] border border-transparent transition-all duration-300'
						>
							Exportar csv com aulas marcadas
						</button>
					) : null}

				</div>
			</div>
		</div>
	);
}
