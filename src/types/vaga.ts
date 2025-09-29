// src/types/vaga.ts
export interface Vaga {
    id: number; // canonical: SEMPRE number
    titulo: string;
    status: "ABERTA" | "FECHADA";
    responsavel?: string;
    local?: string;
    contrato?: string;
    salario?: string;
    abertura?: string;
    fechamento?: string;
    descricao?: string;
    requisitos?: string;
    beneficios?: string;
  }
  