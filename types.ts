export interface PublisherPrivileges {
    canGiveTalks: boolean;
    canConductCBS: boolean;
    canReadCBS: boolean;
    canPray: boolean;
    canPreside: boolean;
}

export interface PublisherPrivilegesBySection {
    canParticipateInTreasures: boolean;
    canParticipateInMinistry: boolean;
    canParticipateInLife: boolean;
}

export interface PublisherAvailability {
    mode: 'always' | 'never'; 
    exceptionDates: string[];
}

export type AgeGroup = 'Adulto' | 'Jovem' | 'Criança';

export interface Publisher {
    id: string;
    name: string;
    gender: 'brother' | 'sister';
    condition: 'Ancião' | 'Servo Ministerial' | 'Publicador';
    phone: string;
    isBaptized: boolean;
    isServing: boolean;
    ageGroup: AgeGroup;
    parentIds: string[];
    isHelperOnly: boolean;
    canPairWithNonParent: boolean;
    privileges: PublisherPrivileges;
    privilegesBySection: PublisherPrivilegesBySection;
    availability: PublisherAvailability;
    aliases: string[];
}

export enum ParticipationType {
    PRESIDENTE = 'Presidente',
    ORACAO_INICIAL = 'Oração Inicial',
    ORACAO_FINAL = 'Oração Final',
    TESOUROS = 'Tesouros da Palavra de Deus',
    MINISTERIO = 'Faça Seu Melhor no Ministério',
    VIDA_CRISTA = 'Nossa Vida Cristã',
    DIRIGENTE = 'Dirigente do EBC',
    LEITOR = 'Leitor do EBC',
    AJUDANTE = 'Ajudante',
    CANTICO = 'Cântico',
    COMENTARIOS_FINAIS = 'Comentários Finais',
}

export interface Participation {
    id: string;
    publisherName: string;
    week: string;
    date: string;
    partTitle: string;
    type: ParticipationType;
    duration?: number;
    order?: number;
    partNumber?: number | null;
}

export interface Workbook {
    id: string;
    name: string;
    fileData: string;
    uploadDate: string;
}

export interface RuleCondition {
    fact: string;
    operator: 'equal' | 'notEqual' | 'in' | 'notIn' | 'contains';
    value: string | boolean | number | string[];
}

export interface Rule {
    id: string;
    description: string;
    isActive: boolean;
    conditions: RuleCondition[];
}

export type EventImpactAction = 'REPLACE_PART' | 'ADD_PART' | 'REPLACE_SECTION' | 'REASSIGN_PART';

export interface EventImpact {
    action: EventImpactAction;
    targetType?: ParticipationType | ParticipationType[];
    reassignTarget?: ParticipationType;
}

export interface EventTemplate {
    id: string;
    name: string;
    description: string;
    impact: EventImpact;
    defaults: {
        duration: number;
        theme?: string;
        requiresTheme: boolean;
        requiresAssignee: boolean;
    };
}

export interface SpecialEventConfiguration {
    timeReduction?: {
        targetType: ParticipationType;
        minutes: number;
    }
}

export interface SpecialEvent {
    id: string;
    week: string;
    templateId: string;
    theme: string;
    assignedTo: string;
    duration: number;
    configuration: SpecialEventConfiguration;
}

export interface ValidationRequest {
    publisher: Publisher;
    partType: string;
    partTitle: string;
    meetingDate: string;
}

export interface ValidationResponse {
    isValid: boolean;
    reason: string;
}

export interface MeetingData {
    week: string;
    parts: Participation[];
}

export interface FactDefinition {
  naturalName: string;
  singleWordName: string;
  description: string;
}

export interface ParticipationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (participations: Participation[]) => void;
  participationToEdit: Participation | null;
  publishers: Publisher[];
  participations: Participation[];
  rules: Rule[];
  specialEvents: SpecialEvent[];
  eventTemplates: EventTemplate[];
}

export interface SpecialEventsModalProps {
    isOpen: boolean;
    onClose: () => void;
    specialEvents: SpecialEvent[];
    eventTemplates: EventTemplate[];
    onSave: (event: SpecialEvent) => Promise<void>;
    onDelete: (id: string) => void;
    onManageTemplates: () => void;
}

export interface PublisherStats {
  publisherId: string;
  publisherName: string;
  totalAssignments: number;
  countTreasures: number;
  countMinistry: number;
  countLife: number;
  countPresidency: number;
  lastAssignmentDate: string | null;
  lastAssignmentWeek: string | null;
  avgDaysBetweenAssignments: number | null;
}

export interface HistoryBackupItem {
    id: string;
    week: string;
    participations: Participation[];
    importedAt: string;
}
