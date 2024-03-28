import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Função essencial para exportar para Excel
/**
 * Converte uma string em um ArrayBuffer.
 *
 * @param {string} s - A string a ser convertida.
 * @returns {ArrayBuffer} O ArrayBuffer gerado.
 */
const s2ab = (s) => {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) {
    view[i] = s.charCodeAt(i) & 0xff;
  }
  return buf;
};

// Funções para exportar para Excel e JSON
// Estas funções recebem um array de objetos e um nome de arquivo
// e exportam os dados para o formato desejado
// Para exportar para Excel, é necessário instalar o pacote xlsx
// Para exportar para JSON, não é necessário instalar nada
/**
 * Exporta os dados para um arquivo Excel.
 *
 * @param {Array<Object>} data - O array de objetos a ser exportado para Excel.
 * @param {string} filename - O nome do arquivo Excel a ser salvo.
 */
export function exportExcel(data, filename) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
  const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
  saveAs(blob, `${filename}`);
}

/**
 * Exporta os dados para um arquivo JSON.
 *
 * @param {Array<Object>} data - O array de objetos a ser exportado para JSON.
 * @param {string} filename - O nome do arquivo JSON a ser salvo.
 */
export function exportJson(data, filename) {
  const jsonString = JSON.stringify(data);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
