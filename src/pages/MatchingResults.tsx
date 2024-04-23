import React, { useState, useEffect } from 'react';
import * as XLSX from "xlsx";
import { gerarHorasPossiveis, isHoraMaisRecente } from "../js/auxilioEscolhaAula";
import { useNavigate } from "react-router-dom";


// const YourComponent = () => {
//   const history = useHistory();

//   const handleVerPossibilidades = () => {
//     // Pass necessary data to the new page, for example:
//     history.push({
//       pathname: "/matching-results", // Define the route for the new page
//       state: {
//         selectedItemCurso,
//         selectedItemUC,
//         selectedItemTurma,
//         selectedItemHoraInicio,
//         selectedItemHoraFim,
//         selectedDataAula,
//         selectedItemDia,
//         selectedItemDiaSemana,
//         selectedCap_Sala,
//         selectedItemCapacidade,
//         selectedItemSala,
//       },
//     });
//   };

//   return (
//     <button onClick={handleVerPossibilidades} className="mt-16 px-8 py-3 bg-[var(--blue)] text-white rounded-[13px] hover:bg-white hover:text-[var(--blue)] hover:border-[var(--blue)] border border-transparent transition-all duration-300">
//       Ver Possibilidades
//     </button>
//   );
// };