import { db } from './db';
import { Participation, HistoryBackupItem } from '../types';
import { generateUUID } from './utils';

export const saveHistoryBackup = async (participations: Participation[]) => {
    try {
        const weeksMap = new Map<string, Participation[]>();
        participations.forEach(p => {
            if (!weeksMap.has(p.week)) weeksMap.set(p.week, []);
            weeksMap.get(p.week)!.push(p);
        });

        const backupItems: HistoryBackupItem[] = [];

        for (const [week, parts] of weeksMap.entries()) {
            const existingBackup = await db.historyBackup.where('week').equals(week).first();
            
            const currentDbParts = await db.participations.where('week').equals(week).toArray();
            const partsToBackup = currentDbParts.length > 0 ? currentDbParts : parts;

            if (existingBackup) {
                await db.historyBackup.put({
                    ...existingBackup,
                    participations: partsToBackup,
                    importedAt: new Date().toISOString()
                });
            } else {
                backupItems.push({
                    id: generateUUID(),
                    week,
                    participations: partsToBackup,
                    importedAt: new Date().toISOString()
                });
            }
        }

        if (backupItems.length > 0) {
            await db.historyBackup.bulkAdd(backupItems);
            console.log(`Backup de histórico salvo/atualizado para ${backupItems.length} semanas.`);
        }
    } catch (e) {
        console.error("Falha ao salvar backup de histórico:", e);
    }
};

export const forceRestoreBackup = async (backupId: string) => {
    const backup = await db.historyBackup.get(backupId);
    if (!backup) throw new Error("Backup não encontrado.");

    await db.participations.where('week').equals(backup.week).delete();
    
    await db.participations.bulkAdd(backup.participations);
    console.log(`Backup da semana ${backup.week} restaurado manualmente.`);
};

export const deleteBackup = async (backupId: string) => {
    await db.historyBackup.delete(backupId);
};

export const getAllBackups = async () => {
    return await db.historyBackup.toArray();
};

export const restoreMissingHistory = async () => {
    try {
        const backups = await db.historyBackup.toArray();
        if (backups.length === 0) return;

        const existingWeeks = new Set(
            (await db.participations.orderBy('week').uniqueKeys())
            .map(w => String(w).trim().toUpperCase())
        );
        
        const participationsToRestore: Participation[] = [];
        let restoredWeeksCount = 0;

        for (const backup of backups) {
            const normalizedBackupWeek = backup.week.trim().toUpperCase();
            
            if (!existingWeeks.has(normalizedBackupWeek)) {
                const count = await db.participations.where('week').equals(backup.week).count();
                
                if (count === 0) {
                    console.log(`Restaurando semana perdida do backup: ${backup.week}`);
                    participationsToRestore.push(...backup.participations);
                    restoredWeeksCount++;
                }
            }
        }

        if (participationsToRestore.length > 0) {
            await db.participations.bulkPut(participationsToRestore); 
            console.log(`RESTAURAÇÃO AUTOMÁTICA: ${restoredWeeksCount} semanas de histórico recuperadas do backup.`);
        }

    } catch (e) {
        console.error("Erro ao tentar restaurar histórico do backup:", e);
    }
};
