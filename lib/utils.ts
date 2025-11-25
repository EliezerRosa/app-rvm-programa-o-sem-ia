import { ParticipationType, Publisher, ValidationResponse } from '../types';

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const monthMap: { [key: string]: number } = {
    'JAN': 0, 'JANEIRO': 0,
    'FEV': 1, 'FEVEREIRO': 1,
    'MAR': 2, 'MARÇO': 2, 'MARCO': 2,
    'ABR': 3, 'ABRIL': 3,
    'MAI': 4, 'MAIO': 4,
    'JUN': 5, 'JUNHO': 5,
    'JUL': 6, 'JULHO': 6,
    'AGO': 7, 'AGOSTO': 7,
    'SET': 8, 'SETEMBRO': 8,
    'OUT': 9, 'OUTUBRO': 9,
    'NOV': 10, 'NOVEMBRO': 10,
    'DEZ': 11, 'DEZEMBRO': 11
};

const monthAbbrUpper: string[] = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

const monthFullToUpperAbbr: { [key: string]: string } = {
    'JANEIRO': 'JAN', 'FEVEREIRO': 'FEV', 'MARÇO': 'MAR', 'ABRIL': 'ABR', 'MAIO': 'MAI', 'JUNHO': 'JUN',
    'JULHO': 'JUL', 'AGOSTO': 'AGO', 'SETEMBRO': 'SET', 'OUTUBRO': 'OUT', 'NOVEMBRO': 'NOV', 'DEZEMBRO': 'DEZ'
};

export function standardizeWeekDate(rawWeek: string, yearContext: number): string {
    if (!rawWeek) return `Semana Indefinida, ${yearContext}`;

    let cleaned = rawWeek.toUpperCase().replace(/^SEMANA\s+(DE\s+)?/i, '').trim();
    
    if (cleaned.match(/\d{4}/) && cleaned.includes(',')) return cleaned;

    cleaned = cleaned.replace(/–/g, '-');

    const splitMonthMatch = cleaned.match(/(\d+)\s+DE\s+([A-ZÇ]+)\s*-\s*(\d+)\s+DE\s+([A-ZÇ]+)/i);
    
    if (splitMonthMatch) {
        const [, day1, month1Full, day2, month2Full] = splitMonthMatch;
        const m1 = monthFullToUpperAbbr[month1Full.toUpperCase()] || month1Full.toUpperCase().substring(0, 3);
        const m2 = monthFullToUpperAbbr[month2Full.toUpperCase()] || month2Full.toUpperCase().substring(0, 3);
        
        if (m1 === 'DEZ' && m2 === 'JAN') {
            return `${day1} de ${m1}, ${yearContext} - ${day2} de ${m2}, ${yearContext + 1}`;
        }
        return `${day1} de ${m1} - ${day2} de ${m2}, ${yearContext}`;
    }

    const singleMonthMatch = cleaned.match(/(\d+)\s*(?:-|A)\s*(\d+)\s+(?:DE\s+)?([A-ZÇ]+)/i);
    
    if (singleMonthMatch) {
        const [, day1, day2, monthFull] = singleMonthMatch;
        const m = monthFullToUpperAbbr[monthFull.toUpperCase()] || monthFull.toUpperCase().substring(0, 3);
        return `${day1}-${day2} de ${m}, ${yearContext}`;
    }

    if (!cleaned.includes(yearContext.toString())) {
        return `${cleaned}, ${yearContext}`;
    }

    return cleaned;
}

export const parseWeekDate = (weekString: string): Date => {
    if (!weekString) return new Date(0);

    const cleaned = weekString.replace(/,/g, ' ').toUpperCase();
    const parts = cleaned.split(/[\s-]+/);

    let day = 0;
    for (const part of parts) {
        const d = parseInt(part, 10);
        if (!isNaN(d) && d > 0 && d <= 31) {
            day = d;
            break;
        }
    }
    if (day === 0) return new Date(0);

    let month: number | undefined;
    let year: number | undefined;
    
    const firstMonthIndex = parts.findIndex(p => monthMap[p] !== undefined);
    
    if (firstMonthIndex === -1) return new Date(0);
    
    month = monthMap[parts[firstMonthIndex]];
    
    for (const part of parts) {
        const y = parseInt(part, 10);
        if (!isNaN(y) && y > 2000 && y < 2100) {
            year = y;
            break;
        }
    }
    
    if (year === undefined) {
       const lastToken = parseInt(parts[parts.length-1], 10);
       if (!isNaN(lastToken) && lastToken > 2000) year = lastToken;
    }

    if (month !== undefined && year !== undefined) {
        return new Date(Date.UTC(year, month, day));
    }

    return new Date(0);
};

export const calculatePartDate = (weekString: string): string => {
    try {
        const startDate = parseWeekDate(weekString);

        if (startDate.getTime() === 0 || isNaN(startDate.getTime())) { 
            return new Date(0).toISOString();
        }
        
        const year = startDate.getUTCFullYear();
        
        const targetDayOfWeek = year % 2 !== 0 ? 3 : 4;

        const dayDifference = targetDayOfWeek - 1; 

        const meetingDate = new Date(startDate.getTime());
        meetingDate.setUTCDate(startDate.getUTCDate() + dayDifference);

        if (isNaN(meetingDate.getTime())) {
            return new Date(0).toISOString();
        }

        return meetingDate.toISOString();
    } catch (e) {
        console.error(`Erro ao calcular data para semana: ${weekString}`, e);
        return new Date(0).toISOString();
    }
};

export const openHtmlInNewTab = (htmlContent: string): void => {
    const newWindow = window.open("", "_blank");
    if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
    } else {
        alert("Não foi possível abrir a nova aba. Por favor, verifique se o seu navegador está bloqueando pop-ups.");
    }
};

export const PAIRABLE_PART_TYPES = [
    ParticipationType.MINISTERIO,
];

export const validatePairing = (student: Publisher, helper: Publisher): ValidationResponse => {
    if (student.ageGroup === 'Criança') {
        const isParent = student.parentIds.includes(helper.id);
        const isAdult = helper.ageGroup === 'Adulto';

        if (isParent) {
            return { isValid: true, reason: '' };
        }

        if (student.canPairWithNonParent && isAdult) {
            return { isValid: true, reason: '' };
        }

        if (!student.canPairWithNonParent) {
            return { isValid: false, reason: `Crianças só podem ter um dos pais como ajudante. Autorização para terceiros não concedida.` };
        }

        if (!isAdult) {
            return { isValid: false, reason: `O ajudante de uma criança deve ser um adulto.` };
        }
    }
    return { isValid: true, reason: '' };
};

function getFirstMonday(date: Date) {
    const day = date.getUTCDay();
    const diff = date.getUTCDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setUTCDate(diff));
}

function formatDateRange(startDate: Date): string {
    const endDate = new Date(startDate);
    endDate.setUTCDate(startDate.getUTCDate() + 6);

    const startDay = startDate.getUTCDate();
    const endDay = endDate.getUTCDate();
    const startMonth = monthAbbrUpper[startDate.getUTCMonth()];
    const endMonth = monthAbbrUpper[endDate.getUTCMonth()];
    const startYear = startDate.getUTCFullYear();
    const endYear = endDate.getUTCFullYear();

    if (startMonth === endMonth) {
        return `${startDay}-${endDay} de ${startMonth}, ${startYear}`;
    } else if (startYear === endYear) {
        return `${startDay} de ${startMonth} - ${endDay} de ${endMonth}, ${startYear}`;
    } else {
        return `${startDay} de ${startMonth}, ${startYear} - ${endDay} de ${endMonth}, ${endYear}`;
    }
}

export function generateWeeksForWorkbook(workbookName: string): string[] {
    const nameMatch = workbookName.match(/(\w+)\/(\w+)\s+(\d{4})/i);
    if (!nameMatch) return [];

    const [, startMonthStr, endMonthStr, yearStr] = nameMatch;
    const year = parseInt(yearStr, 10);
    const startMonthIndex = monthMap[startMonthStr.toUpperCase()];
    const endMonthIndex = monthMap[endMonthStr.toUpperCase()];

    if (startMonthIndex === undefined || endMonthIndex === undefined) return [];

    const startDate = new Date(Date.UTC(year, startMonthIndex, 1));
    const endDate = new Date(Date.UTC(year, endMonthIndex + 1, 0));

    const weeks: string[] = [];
    let currentMonday = getFirstMonday(startDate);

    while (currentMonday <= endDate) {
        weeks.push(formatDateRange(currentMonday));
        currentMonday.setUTCDate(currentMonday.getUTCDate() + 7);
    }

    return weeks;
}

export function inferParticipationType(partTitle: string): ParticipationType {
    const title = partTitle.toLowerCase();

    if (title.includes('presidente')) return ParticipationType.PRESIDENTE;
    if (title.includes('oração inicial')) return ParticipationType.ORACAO_INICIAL;
    if (title.includes('oração final')) return ParticipationType.ORACAO_FINAL;
    if (title.includes('cântico')) return ParticipationType.CANTICO;
    if (title.includes('comentários finais')) return ParticipationType.COMENTARIOS_FINAIS;
    if (title.includes('ajudante')) return ParticipationType.AJUDANTE;

    if (title.includes('leitura da bíblia') || title.includes('joias espirituais')) {
        return ParticipationType.TESOUROS;
    }
    
    if (title.includes('iniciando conversas') || title.includes('cultivando o interesse') || title.includes('fazendo discípulos') || title.includes('explicando suas crenças') || title.includes('discurso')) {
        return ParticipationType.MINISTERIO;
    }

    if (title.includes('estudo bíblico de congregação')) {
        return ParticipationType.DIRIGENTE;
    }
    
    const treasuresKeywords = ['tesouros', 'pacto', 'salvador', 'agradeçam', 'rei jesus', 'retribuir', 'caminho', 'perseverar', 'sofrimento'];
    if (treasuresKeywords.some(kw => title.includes(kw))) {
        return ParticipationType.TESOUROS;
    }

    const lifeKeywords = ['amor', 'dinheiro', 'promessas', 'necessidades locais', 'organização', 'sofrer'];
    if (lifeKeywords.some(kw => title.includes(kw))) {
        return ParticipationType.VIDA_CRISTA;
    }
    
    return ParticipationType.VIDA_CRISTA;
}

export function normalizeName(name: string): string {
    if (!name) return '';
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}
