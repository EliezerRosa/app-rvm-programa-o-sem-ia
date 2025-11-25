import { Participation, ParticipationType } from '../types';
import { generateUUID, calculatePartDate } from './utils';

const rawParticipations = [
  { publisherName: 'Eliezer Rosa', week: '4-10 de NOV, 2024', partTitle: 'Presidente', type: ParticipationType.PRESIDENTE },
  { publisherName: '', week: '4-10 de NOV, 2024', partTitle: 'Cântico 3', type: ParticipationType.CANTICO },
  { publisherName: 'Eliezer Rosa', week: '4-10 de NOV, 2024', partTitle: 'Oração Inicial', type: ParticipationType.ORACAO_INICIAL },
  { publisherName: 'Samuel Almeida', week: '4-10 de NOV, 2024', partTitle: 'Leitura da Bíblia', type: ParticipationType.TESOUROS, duration: 4 },
  { publisherName: 'Suellen Correa', week: '4-10 de NOV, 2024', partTitle: 'Iniciando conversas', type: ParticipationType.MINISTERIO, duration: 3 },
  { publisherName: 'Keyla Costa', week: '4-10 de NOV, 2024', partTitle: 'Ajudante', type: ParticipationType.AJUDANTE },
  { publisherName: '', week: '4-10 de NOV, 2024', partTitle: 'Cântico 84', type: ParticipationType.CANTICO },
  { publisherName: 'Marcos Rogério', week: '4-10 de NOV, 2024', partTitle: 'Necessidades Locais', type: ParticipationType.VIDA_CRISTA, duration: 15 },
  { publisherName: 'Renato Oliveira', week: '4-10 de NOV, 2024', partTitle: 'Estudo bíblico de congregação', type: ParticipationType.DIRIGENTE, duration: 30 },
  { publisherName: 'Júnior Fouraux', week: '4-10 de NOV, 2024', partTitle: 'Leitor do EBC', type: ParticipationType.LEITOR },
  { publisherName: 'Eliezer Rosa', week: '4-10 de NOV, 2024', partTitle: 'Comentários Finais', type: ParticipationType.COMENTARIOS_FINAIS },
  { publisherName: '', week: '4-10 de NOV, 2024', partTitle: 'Cântico 97', type: ParticipationType.CANTICO },
  { publisherName: 'André Luiz', week: '4-10 de NOV, 2024', partTitle: 'Oração Final', type: ParticipationType.ORACAO_FINAL },
];

export const initialParticipations: Participation[] = rawParticipations.map(p => ({
    ...p,
    id: generateUUID(),
    date: calculatePartDate(p.week),
}));
