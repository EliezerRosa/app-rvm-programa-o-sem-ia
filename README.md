# App RVM - Designações sem IA

Sistema para gerenciamento de designações da Reunião Vida e Ministério (RVM) - Versão sem Inteligência Artificial.

## Funcionalidades

- 📋 **Visualização de Pautas**: Visualize e imprima as pautas das reuniões
- 👥 **Gerenciamento de Publicadores**: Cadastro e consulta de publicadores
- 📝 **Designações**: Histórico de designações por semana
- 📚 **Apostilas**: Gerenciamento de apostilas do ministério
- 💾 **Backup/Restore**: Exportação e importação de dados

## Como Executar

### Pré-requisitos

- Node.js 18+
- npm

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

### Build para Produção

```bash
npm run build
```

## Tecnologias

- React 19
- TypeScript
- Vite
- Dexie (IndexedDB)
- Tailwind CSS (via CDN)

## Estrutura do Projeto

```
├── App.tsx              # Componente principal
├── types.ts             # Definições de tipos TypeScript
├── index.tsx            # Ponto de entrada React
├── index.html           # HTML principal
├── lib/                 # Bibliotecas e utilitários
│   ├── db.ts           # Configuração do IndexedDB
│   ├── storage.ts      # Funções de armazenamento
│   ├── utils.ts        # Funções utilitárias
│   └── ...             # Outros módulos
└── components/          # Componentes React
    └── icons.tsx        # Ícones SVG
```

## Licença

Este projeto é de uso livre para congregações das Testemunhas de Jeová.