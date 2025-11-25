import { EventTemplate, ParticipationType } from '../types';

export const initialEventTemplates: EventTemplate[] = [
    {
        id: 'tpl_visita_sc',
        name: 'Visita do superintendente de circuito',
        description: "A pauta é ajustada para a visita. A parte principal da 'Nossa Vida Cristã' é substituída por um discurso de serviço.",
        impact: {
            action: 'REPLACE_PART',
            targetType: ParticipationType.DIRIGENTE,
        },
        defaults: {
            duration: 30,
            requiresTheme: true,
            requiresAssignee: true,
        },
    },
    {
        id: 'tpl_memorial',
        name: 'Memorial da morte de Cristo',
        description: "Toda a reunião do meio de semana é cancelada e substituída pela celebração do Memorial.",
        impact: {
            action: 'REPLACE_SECTION',
            targetType: [ParticipationType.TESOUROS, ParticipationType.MINISTERIO, ParticipationType.VIDA_CRISTA, ParticipationType.DIRIGENTE, ParticipationType.LEITOR],
        },
        defaults: {
            duration: 45,
            theme: "Celebração Anual da Morte de Cristo",
            requiresTheme: false,
            requiresAssignee: true,
        },
    },
];
