import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import * as XLSX from "xlsx";

/**
 * Componente para exibir e editar os dados de uma planilha do Excel.
 *
 * Este componente é responsável por exibir os dados de uma planilha do Excel em uma tabela
 * e permitir a edição desses dados.
 *
 * @returns {JSX.Element} O componente EditExcel.
 */
export default function EditExcel() {
  const location = useLocation();
  const { tableData } = location.state;

  return (
    <div>
      <h2>Dados do Excel:</h2>
      <table>
        <thead>
          <tr>
            {tableData.length > 0 &&
              Object.keys(tableData[0]).map((key, index) => (
                <th key={index}>{key}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row: number, rowIndex: number) => (
            <tr key={rowIndex}>
              {Object.values(row).map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
