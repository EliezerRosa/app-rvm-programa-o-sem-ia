import { Rule, ParticipationType } from '../types';
import { generateUUID } from './utils';

export const initialRules: Rule[] = [
  {
    id: generateUUID(),
    description: 'Não designar publicadores que não estão atuantes.',
    isActive: true,
    conditions: [
      { fact: 'isServing', operator: 'equal', value: false }
    ]
  },
  {
    id: generateUUID(),
    description: 'Apenas anciãos ou servos ministeriais podem presidir a reunião.',
    isActive: true,
    conditions: [
      { fact: 'partType', operator: 'equal', value: ParticipationType.PRESIDENTE },
      { fact: 'condition', operator: 'notIn', value: ['Ancião', 'Servo Ministerial'] }
    ]
  },
  {
    id: generateUUID(),
    description: 'Apenas anciãos podem dirigir o Estudo Bíblico de Congregação.',
    isActive: true,
    conditions: [
      { fact: 'partType', operator: 'equal', value: ParticipationType.DIRIGENTE },
      { fact: 'condition', operator: 'notEqual', value: 'Ancião' }
    ]
  },
  {
    id: generateUUID(),
    description: 'Apenas irmãos batizados podem fazer a oração.',
    isActive: true,
    conditions: [
      { fact: 'partType', operator: 'in', value: [ParticipationType.ORACAO_INICIAL, ParticipationType.ORACAO_FINAL] },
      { fact: 'isBaptized', operator: 'equal', value: false }
    ]
  },
   {
    id: generateUUID(),
    description: 'Apenas irmãos podem ser Leitores do Estudo Bíblico.',
    isActive: true,
    conditions: [
        { fact: 'partType', operator: 'equal', value: ParticipationType.LEITOR },
        { fact: 'gender', operator: 'equal', value: 'sister' }
    ]
  },
  {
    id: generateUUID(),
    description: "Irmãs não podem ser designadas para partes do tipo 'Discurso'.",
    isActive: true,
    conditions: [
      { fact: 'gender', operator: 'equal', value: 'sister' },
      { fact: 'partTitle', operator: 'contains', value: 'Discurso' }
    ]
  },
];
