import { Publisher } from '../types';

const defaultAvailability = { mode: 'always' as const, exceptionDates: [] };
const defaultNewFields = { ageGroup: 'Adulto' as const, parentIds: [], isHelperOnly: false, canPairWithNonParent: false };

const createBrotherPrivileges = (canRead: boolean, canGiveTalks: boolean, canPray: boolean, canPreside: boolean) => ({
    canGiveTalks,
    canConductCBS: canPreside,
    canReadCBS: canRead,
    canPray,
    canPreside,
});

export const initialPublishers: Publisher[] = [
    // ANCIÃOS
    {
        id: 'anc1', name: 'Diego Fontana', gender: 'brother', condition: 'Ancião', phone: '', isBaptized: true, isServing: true, ...defaultNewFields,
        privileges: createBrotherPrivileges(true, true, true, true),
        privilegesBySection: { canParticipateInTreasures: true, canParticipateInMinistry: true, canParticipateInLife: true },
        availability: defaultAvailability, aliases: []
    },
    {
        id: 'anc2', name: 'Domingos Oliveira', gender: 'brother', condition: 'Ancião', phone: '', isBaptized: true, isServing: true, ...defaultNewFields,
        privileges: createBrotherPrivileges(true, true, true, true),
        privilegesBySection: { canParticipateInTreasures: true, canParticipateInMinistry: true, canParticipateInLife: true },
        availability: defaultAvailability, aliases: []
    },
    {
        id: 'anc3', name: 'Eliezer Rosa', gender: 'brother', condition: 'Ancião', phone: '', isBaptized: true, isServing: true, ...defaultNewFields,
        privileges: createBrotherPrivileges(true, true, true, true),
        privilegesBySection: { canParticipateInTreasures: true, canParticipateInMinistry: true, canParticipateInLife: true },
        availability: defaultAvailability, aliases: []
    },
    {
        id: 'anc4', name: 'Israel Vieira', gender: 'brother', condition: 'Ancião', phone: '', isBaptized: true, isServing: true, ...defaultNewFields,
        privileges: createBrotherPrivileges(true, true, true, true),
        privilegesBySection: { canParticipateInTreasures: true, canParticipateInMinistry: true, canParticipateInLife: true },
        availability: defaultAvailability, aliases: []
    },
    {
        id: 'anc5', name: 'Marcos Rogério', gender: 'brother', condition: 'Ancião', phone: '', isBaptized: true, isServing: true, ...defaultNewFields,
        privileges: createBrotherPrivileges(true, true, true, true),
        privilegesBySection: { canParticipateInTreasures: true, canParticipateInMinistry: true, canParticipateInLife: true },
        availability: defaultAvailability, aliases: []
    },
    {
        id: 'anc6', name: 'Renato Oliveira', gender: 'brother', condition: 'Ancião', phone: '', isBaptized: true, isServing: true, ...defaultNewFields,
        privileges: createBrotherPrivileges(true, true, true, true),
        privilegesBySection: { canParticipateInTreasures: true, canParticipateInMinistry: true, canParticipateInLife: true },
        availability: defaultAvailability, aliases: []
    },

    // SERVO MINISTERIAIS
    {
        id: 'sm1', name: 'Samuel Almeida', gender: 'brother', condition: 'Servo Ministerial', phone: '', isBaptized: true, isServing: true, ...defaultNewFields,
        privileges: createBrotherPrivileges(true, true, true, false),
        privilegesBySection: { canParticipateInTreasures: true, canParticipateInMinistry: true, canParticipateInLife: true },
        availability: defaultAvailability, aliases: []
    },
    {
        id: 'sm2', name: 'Júnior Fouraux', gender: 'brother', condition: 'Servo Ministerial', phone: '', isBaptized: true, isServing: true, ...defaultNewFields,
        privileges: createBrotherPrivileges(true, true, true, false),
        privilegesBySection: { canParticipateInTreasures: true, canParticipateInMinistry: true, canParticipateInLife: true },
        availability: defaultAvailability, aliases: []
    },

    // IRMÃOS
    { id: 'bro1', name: 'Carlos Ramos', gender: 'brother', condition: 'Publicador', phone: '', isBaptized: true, isServing: true, ...defaultNewFields, privileges: createBrotherPrivileges(true, false, false, false), privilegesBySection: { canParticipateInTreasures: true, canParticipateInMinistry: true, canParticipateInLife: true }, availability: defaultAvailability, aliases: [] },
    { id: 'bro2', name: 'André Luiz', gender: 'brother', condition: 'Publicador', phone: '', isBaptized: true, isServing: true, ...defaultNewFields, privileges: createBrotherPrivileges(true, false, true, false), privilegesBySection: { canParticipateInTreasures: true, canParticipateInMinistry: true, canParticipateInLife: true }, availability: defaultAvailability, aliases: [] },

    // IRMÃS
    { id: 'sis1', name: 'Ana Paula Oliveira', gender: 'sister', condition: 'Publicador', phone: '', isBaptized: true, isServing: true, ...defaultNewFields, privileges: createBrotherPrivileges(false, false, false, false), privilegesBySection: { canParticipateInTreasures: false, canParticipateInMinistry: true, canParticipateInLife: false }, availability: defaultAvailability, aliases: [] },
    { id: 'sis2', name: 'Ariane Bello', gender: 'sister', condition: 'Publicador', phone: '', isBaptized: true, isServing: true, ...defaultNewFields, privileges: createBrotherPrivileges(false, false, false, false), privilegesBySection: { canParticipateInTreasures: false, canParticipateInMinistry: true, canParticipateInLife: false }, availability: defaultAvailability, aliases: [] },
    { id: 'sis3', name: 'Keyla Costa', gender: 'sister', condition: 'Publicador', phone: '', isBaptized: true, isServing: true, ...defaultNewFields, privileges: createBrotherPrivileges(false, false, false, false), privilegesBySection: { canParticipateInTreasures: false, canParticipateInMinistry: true, canParticipateInLife: false }, availability: defaultAvailability, aliases: [] },
    { id: 'sis4', name: 'Suellen Correa', gender: 'sister', condition: 'Publicador', phone: '', isBaptized: true, isServing: true, ...defaultNewFields, privileges: createBrotherPrivileges(false, false, false, false), privilegesBySection: { canParticipateInTreasures: false, canParticipateInMinistry: true, canParticipateInLife: false }, availability: defaultAvailability, aliases: [] },
];
