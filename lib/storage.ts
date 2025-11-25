import { db } from './db';
import { Publisher, Participation, Workbook, Rule, SpecialEvent, EventTemplate } from '../types';
import { initialPublishers } from './initialData';
import { initialParticipations } from './initialParticipations';
import { initialWorkbooks } from './initialWorkbooks';
import { initialRules } from './initialRules';
import { initialSpecialEvents } from './initialSpecialEvents';
import { initialEventTemplates } from './initialEventTemplates';
import { calculatePartDate, standardizeWeekDate } from './utils';
import { restoreMissingHistory } from './historyBackup';

const repairDatabaseIntegrity = async () => {
    try {
        const participations = await db.participations.toArray();
        const updates: Promise<any>[] = [];

        for (const p of participations) {
            let needsUpdate = false;
            let newDate = p.date;
            let newWeek = p.week;

            const existingYearMatch = p.week.match(/(20\d{2})/);
            const existingYear = existingYearMatch ? parseInt(existingYearMatch[1], 10) : 2024;

            if (!p.week.match(/\d{4}/) || p.week.toUpperCase().includes('SEMANA DE')) {
                newWeek = standardizeWeekDate(p.week, existingYear); 
                if (newWeek !== p.week) needsUpdate = true;
            }

            const dateObj = new Date(p.date);
            if (!p.date || isNaN(dateObj.getTime()) || dateObj.getFullYear() <= 1970) {
                newDate = calculatePartDate(newWeek);
                if (newDate !== p.date && newDate !== new Date(0).toISOString()) {
                     needsUpdate = true;
                }
            }

            if (needsUpdate) {
                updates.push(db.participations.update(p.id, { week: newWeek, date: newDate }));
            }
        }

        if (updates.length > 0) {
            await Promise.all(updates);
            console.log(`Integridade do banco verificada: ${updates.length} registros corrigidos em background.`);
        }
    } catch (e) {
        console.error("Erro não-fatal durante verificação de integridade:", e);
    }
};

export const initStorage = async () => {
    try {
        if (navigator.storage && navigator.storage.persist) {
            const isPersisted = await navigator.storage.persist();
            console.log(`Modo de Armazenamento Persistente: ${isPersisted ? 'ATIVO' : 'NEGADO pelo navegador'}`);
        }

        if (!(db as any).isOpen()) {
            await (db as any).open();
        }

        const backupCount = await db.historyBackup.count();
        
        if (backupCount > 0) {
            console.log("Backups encontrados. Verificando integridade do histórico...");
            await restoreMissingHistory();
        }

        const publisherCount = await db.publishers.count();
        if (publisherCount === 0) {
            console.log("Populando tabela de publicadores...");
            await db.publishers.bulkAdd(initialPublishers);
        }

        const participationCount = await db.participations.count();
        if (participationCount === 0 && backupCount === 0) {
            console.log("Populando tabela de participações (Dados de Exemplo)...");
            await db.participations.bulkAdd(initialParticipations);
        }

        const workbookCount = await db.workbooks.count();
        if (workbookCount === 0) {
            console.log("Populando tabela de apostilas...");
            await db.workbooks.bulkAdd(initialWorkbooks);
        }

        const ruleCount = await db.rules.count();
        if (ruleCount === 0) {
            console.log("Populando tabela de regras...");
            await db.rules.bulkAdd(initialRules);
        }
        
        const specialEventCount = await db.specialEvents.count();
        if (specialEventCount === 0) {
             console.log("Populando tabela de eventos especiais...");
             await db.specialEvents.bulkAdd(initialSpecialEvents);
        }

        const templateCount = await db.eventTemplates.count();
        if (templateCount === 0) {
            console.log("Populando tabela de modelos de evento...");
            await db.eventTemplates.bulkAdd(initialEventTemplates);
        }

        setTimeout(() => repairDatabaseIntegrity(), 1000);
        
        console.log("Armazenamento inicializado com sucesso.");
        
    } catch (e) {
        console.error("Falha crítica ao inicializar o armazenamento:", e);
    }
};

export const getAllPublishers = () => db.publishers.toArray();
export const getAllParticipations = () => db.participations.toArray();
export const getAllWorkbooks = () => db.workbooks.toArray();
export const getAllRules = () => db.rules.toArray();
export const getAllSpecialEvents = () => db.specialEvents.toArray();
export const getAllEventTemplates = () => db.eventTemplates.toArray();

export const getAllData = async () => {
    if (!(db as any).isOpen()) await (db as any).open();

    const [publishers, participations, workbooks, rules, specialEvents, eventTemplates] = await Promise.all([
        getAllPublishers(),
        getAllParticipations(),
        getAllWorkbooks(),
        getAllRules(),
        getAllSpecialEvents(),
        getAllEventTemplates(),
    ]);
    return { publishers, participations, workbooks, rules, specialEvents, eventTemplates };
}

export const savePublisher = (publisher: Publisher) => db.publishers.put(publisher);
export const deletePublisher = (id: string) => db.publishers.delete(id);

export const saveParticipation = (participation: Participation) => db.participations.put(participation);
export const deleteParticipation = (id: string) => db.participations.delete(id);
export const deleteParticipationsByWeek = async (week: string) => {
    await Promise.all([
        db.participations.where('week').equals(week).delete(),
        db.historyBackup.where('week').equals(week).delete(),
    ]);
};

export const saveWorkbook = (workbook: Workbook) => db.workbooks.put(workbook);
export const deleteWorkbook = (id: string) => db.workbooks.delete(id);

export const saveRule = (rule: Rule) => db.rules.put(rule);
export const deleteRule = (id: string) => db.rules.delete(id);

export const saveSpecialEvent = (event: SpecialEvent) => db.specialEvents.put(event);
export const deleteSpecialEvent = (id: string) => db.specialEvents.delete(id);

export const saveEventTemplate = (template: EventTemplate) => db.eventTemplates.put(template);
export const deleteEventTemplate = (id: string) => db.eventTemplates.delete(id);

export const clearAllData = async () => {
    await Promise.all([
        db.publishers.clear(),
        db.participations.clear(),
        db.workbooks.clear(),
        db.rules.clear(),
        db.specialEvents.clear(),
        db.eventTemplates.clear(),
        db.settings.clear(),
        db.historyBackup.clear(),
    ]);
};
