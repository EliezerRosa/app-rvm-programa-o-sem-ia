import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Publisher, Participation, Workbook, Rule, MeetingData, ParticipationType, SpecialEvent, EventTemplate } from './types';
import { initStorage, getAllData, savePublisher, deletePublisher, saveParticipation, deleteParticipation, deleteParticipationsByWeek, saveWorkbook, deleteWorkbook, saveRule, deleteRule, clearAllData, saveSpecialEvent, deleteSpecialEvent, saveEventTemplate, deleteEventTemplate } from './lib/storage';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, CogIcon } from './components/icons';
import { getScheduleHtml } from './lib/scheduleTemplate';
import { openHtmlInNewTab, calculatePartDate, generateUUID, parseWeekDate, normalizeName, inferParticipationType } from './lib/utils';
import { saveHistoryBackup } from './lib/historyBackup';

type ActiveTab = 'Pauta' | 'Participações' | 'Publicadores' | 'Apostilas';
type ItemToDelete = Publisher | Participation | Workbook | Rule | SpecialEvent | EventTemplate | { type: 'week'; week: string } | null;

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('Pauta');
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [participations, setParticipations] = useState<Participation[]>([]);
    const [workbooks, setWorkbooks] = useState<Workbook[]>([]);
    const [rules, setRules] = useState<Rule[]>([]);
    const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([]);
    const [eventTemplates, setEventTemplates] = useState<EventTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [publisherSearch, setPublisherSearch] = useState('');
    const [scheduleWeekFilter, setScheduleWeekFilter] = useState('Todas as Semanas');

    const loadData = useCallback(async () => {
        setIsLoading(true);
        await initStorage();
        const data = await getAllData();
        setPublishers(data.publishers);
        setParticipations(data.participations);
        setWorkbooks(data.workbooks.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()));
        setRules(data.rules);
        setSpecialEvents(data.specialEvents);
        setEventTemplates(data.eventTemplates);
        setIsLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const scheduleData: MeetingData[] = useMemo(() => {
        const weeks: { [week: string]: Participation[] } = {};
        participations.forEach(p => {
            if (!weeks[p.week]) weeks[p.week] = [];
            weeks[p.week].push(p);
        });
        return Object.keys(weeks).map(week => ({ week, parts: weeks[week] })).sort((a, b) => parseWeekDate(b.week).getTime() - parseWeekDate(a.week).getTime());
    }, [participations]);
    
    const scheduledWeeks = useMemo(() => scheduleData.map(s => s.week), [scheduleData]);

    const filteredPublishers = useMemo(() => publishers.filter(p => p.name.toLowerCase().includes(publisherSearch.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name)), [publishers, publisherSearch]);
    
    const scheduleWeeks = useMemo(() => ['Todas as Semanas', ...scheduleData.map(s => s.week)], [scheduleData]);
    const filteredScheduleData = useMemo(() => scheduleData.filter(m => (scheduleWeekFilter === 'Todas as Semanas' || m.week === scheduleWeekFilter)), [scheduleData, scheduleWeekFilter]);

    const handleExportData = async () => {
        const data = await getAllData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `designacoes_rvm_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    };
    
    const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const fileContent = ev.target?.result;
                if (typeof fileContent !== 'string') {
                    throw new Error("Falha ao ler o arquivo.");
                }
                const data = JSON.parse(fileContent);

                if (!data.publishers || !data.participations) {
                    throw new Error("Arquivo de backup inválido.");
                }
                if (window.confirm("Isso substituirá TODOS os dados existentes. Tem certeza?")) {
                    await clearAllData();
                    await Promise.all([
                        ...data.publishers.map((p: Publisher) => savePublisher(p)),
                        ...data.participations.map((p: Participation) => saveParticipation(p)),
                        ...data.workbooks.map((w: Workbook) => saveWorkbook(w)),
                        ...(data.rules || []).map((r: Rule) => saveRule(r)),
                        ...(data.eventTemplates || []).map((t: EventTemplate) => saveEventTemplate(t)),
                        ...(data.specialEvents || []).map((e: SpecialEvent) => saveSpecialEvent(e)),
                    ]);
                    alert("Dados importados com sucesso!");
                    loadData();
                }
            } catch (error) {
                const typedError = error as Error;
                alert(`Erro ao importar dados: ${typedError.message}`);
            } finally {
                e.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleOpenPrintableView = (m: MeetingData) =>
        openHtmlInNewTab(
            getScheduleHtml(m, "Congregação - RVM", publishers, specialEvents, eventTemplates)
        );

    const handleDeleteWeek = async (meeting: MeetingData) => {
        if (window.confirm(`Tem certeza que deseja excluir a pauta da semana "${meeting.week}"?`)) {
            await deleteParticipationsByWeek(meeting.week);
            loadData();
        }
    };

    const renderScheduleTab = () => (
        <div className="space-y-6">
            {filteredScheduleData.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <p className="text-gray-500 dark:text-gray-400">Nenhuma pauta encontrada.</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">As pautas são criadas quando você adiciona designações.</p>
                </div>
            ) : (
                filteredScheduleData.map(meeting => (
                    <div key={meeting.week} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{meeting.week}</h3>
                            <div className="flex space-x-2">
                                <button onClick={() => handleOpenPrintableView(meeting)} className="btn-primary text-sm">
                                    Imprimir
                                </button>
                                <button onClick={() => handleDeleteWeek(meeting)} className="text-red-600 hover:text-red-800 text-sm">
                                    Excluir
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b dark:border-gray-700">
                                        <th className="text-left py-2 text-gray-600 dark:text-gray-400">Parte</th>
                                        <th className="text-left py-2 text-gray-600 dark:text-gray-400">Designado</th>
                                        <th className="text-left py-2 text-gray-600 dark:text-gray-400">Tipo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {meeting.parts.map(part => (
                                        <tr key={part.id} className="border-b dark:border-gray-700">
                                            <td className="py-2">{part.partTitle}</td>
                                            <td className="py-2">{part.publisherName || '-'}</td>
                                            <td className="py-2 text-sm text-gray-500">{part.type}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    const renderPublishersTab = () => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Condição</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gênero</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredPublishers.map(publisher => (
                        <tr key={publisher.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{publisher.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{publisher.condition}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{publisher.gender === 'brother' ? 'Irmão' : 'Irmã'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${publisher.isServing ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {publisher.isServing ? 'Ativo' : 'Inativo'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderParticipationsTab = () => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Semana</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Parte</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Designado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {participations.slice(0, 50).map(p => (
                        <tr key={p.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{p.week}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{p.partTitle}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{p.publisherName || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.type}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {participations.length > 50 && (
                <div className="px-6 py-4 text-sm text-gray-500">
                    Exibindo 50 de {participations.length} designações.
                </div>
            )}
        </div>
    );

    const renderWorkbooksTab = () => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data de Upload</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {workbooks.map(workbook => (
                        <tr key={workbook.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{workbook.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(workbook.uploadDate).toLocaleDateString('pt-BR')}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Pauta': return renderScheduleTab();
            case 'Participações': return renderParticipationsTab();
            case 'Publicadores': return renderPublishersTab();
            case 'Apostilas': return renderWorkbooksTab();
            default: return null;
        }
    };
    
    if (isLoading) return <div className="flex justify-center items-center h-screen"><div className="text-xl text-gray-500">Carregando banco de dados...</div></div>;
    
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div className="sticky top-0 z-30 bg-gray-100 dark:bg-gray-900 shadow-md">
                <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Designações na RVM</h1>
                        <div className="flex items-center space-x-2">
                            <input type="file" id="import-file" className="hidden" accept=".json" onChange={handleImportData} />
                            <button onClick={() => document.getElementById('import-file')?.click()} className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400" title="Importar Backup">
                                <ArrowUpTrayIcon className="w-6 h-6"/>
                            </button>
                            <button onClick={handleExportData} className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400" title="Exportar Backup">
                                <ArrowDownTrayIcon className="w-6 h-6"/>
                            </button>
                        </div>
                    </div>
                </header>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-6 overflow-x-auto">
                            {(['Pauta', 'Participações', 'Publicadores', 'Apostilas'] as ActiveTab[]).map(tab => (
                                <button 
                                    key={tab} 
                                    onClick={() => setActiveTab(tab)} 
                                    className={`${activeTab === tab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="w-full md:w-auto flex-grow">
                            {activeTab === 'Pauta' && (
                                <select 
                                    value={scheduleWeekFilter} 
                                    onChange={e => setScheduleWeekFilter(e.target.value)} 
                                    className="px-3 py-2 bg-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                                >
                                    {scheduleWeeks.map(w => <option key={w} value={w}>{w}</option>)}
                                </select>
                            )}
                            {activeTab === 'Publicadores' && (
                                <input 
                                    type="search" 
                                    placeholder="Buscar por nome..." 
                                    value={publisherSearch} 
                                    onChange={e => setPublisherSearch(e.target.value)} 
                                    className="w-full md:w-64 px-3 py-2 bg-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black placeholder-gray-500 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {renderTabContent()}
            </main>
            
            <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-gray-500 text-sm">
                <p>App de Designações RVM - Versão sem IA</p>
            </footer>
        </div>
    );
};

export default App;
