# NotaGo Web - Documentação

## Visão Geral
NotaGo Web é uma aplicação web progressiva (PWA) que permite escanear QR codes de notas fiscais eletrônicas, extrair seus dados, armazenar localmente e exportar em formato CSV. Desenvolvida para ser acessada diretamente pelo navegador do celular, sem necessidade de instalação.

## Funcionalidades Principais
1. **Escaneamento de QR Code**: Utiliza a câmera do celular para ler QR codes de notas fiscais.
2. **Busca de Dados**: Extrai informações da nota fiscal a partir da chave de acesso.
3. **Armazenamento Local**: Salva os dados das notas no próprio dispositivo.
4. **Histórico com Resumo Mensal**: Exibe todas as notas salvas e calcula o total de gastos do mês.
5. **Detalhes da Nota**: Mostra informações detalhadas de cada nota fiscal.
6. **Exportação CSV**: Permite exportar os dados para planilhas.

## Estrutura do Projeto
```
notago-web/
├── public/                  # Arquivos estáticos
│   ├── index.html           # Página HTML principal
│   └── manifest.json        # Configuração PWA
├── src/                     # Código fonte
│   ├── components/          # Componentes reutilizáveis
│   │   └── QrScanner.jsx    # Componente de scanner QR
│   ├── pages/               # Páginas principais
│   │   ├── Home.jsx         # Tela inicial (botões)
│   │   ├── Scanner.jsx      # Tela de scanner
│   │   ├── History.jsx      # Tela de histórico
│   │   └── NoteDetail.jsx   # Tela de detalhes da nota
│   ├── services/            # Serviços e lógica de negócio
│   │   ├── sefazService.js  # Serviço para buscar dados na SEFAZ
│   │   ├── storageService.js # Serviço para armazenamento local
│   │   └── csvService.js    # Serviço para exportação CSV
│   ├── App.jsx              # Componente principal e rotas
│   ├── index.jsx            # Ponto de entrada da aplicação
│   └── styles.css           # Estilos globais
└── package.json             # Dependências e scripts
```

## Tecnologias Utilizadas
- **React**: Framework JavaScript para construção da interface
- **React Router**: Para navegação entre páginas
- **HTML5 QR Code**: Biblioteca para leitura de QR codes
- **Dexie.js**: Wrapper para IndexedDB (armazenamento local)
- **GitHub Pages**: Para hospedagem gratuita

## Instruções de Publicação
1. Clone o repositório para sua máquina local:
   ```
   git clone https://github.com/Karogot/notago-web.git
   cd notago-web
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Publique no GitHub Pages:
   ```
   npm run deploy
   ```

4. Acesse o site:
   ```
   https://karogot.github.io/notago-web
   ```

## Limitações e Considerações
- A versão atual simula a busca de dados na SEFAZ, pois o acesso real requer um backend para contornar limitações de CORS.
- O armazenamento é feito localmente no navegador, então os dados não são sincronizados entre dispositivos.
- Para uso em produção, seria recomendável implementar um backend real para busca de dados na SEFAZ.

## Próximos Passos Sugeridos
1. Implementar um backend real para busca de dados na SEFAZ
2. Adicionar autenticação de usuários para salvar dados na nuvem
3. Melhorar a análise de gastos com gráficos e categorização
4. Implementar notificações e lembretes

---

Desenvolvido por Manus para atender às necessidades específicas do usuário, com foco em simplicidade, funcionalidade e design limpo.
