# NotaGo

App Android que lê o QR code da nota fiscal (NFC-e), guarda os produtos e preços num
acervo compartilhado, e ajuda a descobrir onde cada produto está mais barato — incluindo
em qual mercado sai mais barato comprar toda a lista de uma vez.

## Por que é um app Android (Capacitor) e não só um site

A consulta real da nota fiscal no portal da SEFAZ só funciona a partir do IP residencial/móvel
do próprio usuário — a SEFAZ-RJ bloqueia acessos vindos de IP de datacenter/nuvem (testado e
confirmado com chaves de acesso reais). Por isso não existe backend fazendo essa consulta: o
app abre a página oficial da SEFAZ dentro de uma WebView nativa embutida (usando
[Capacitor](https://capacitorjs.com/) + [@capgo/capacitor-inappbrowser](https://github.com/Cap-go/capacitor-inappbrowser))
e lê os dados renderizados ali, usando o IP real do celular.

iPhone fica para depois: compilar a versão iOS da Capacitor exige Xcode, que só roda em Mac.

## Funcionalidades
1. **Escaneamento de QR Code** da NFC-e, com leitura real (não simulada) via WebView embutida.
2. **Acervo compartilhado** (Supabase/Postgres): cada nota lida alimenta uma base de preços por
   produto/loja usada por todos os usuários do app.
3. **Histórico pessoal** salvo localmente (Dexie/IndexedDB), com resumo mensal de gastos.
4. **Comparador de preços** (em desenvolvimento): envie sua lista de compras e descubra o menor
   preço por item e em qual mercado sai mais barato comprar tudo.
5. **Exportação CSV** do histórico pessoal.

## Estrutura do projeto
```
notago-web/
├── android/                  # Projeto nativo Android gerado pelo Capacitor
├── supabase/
│   └── schema.sql            # Schema do acervo compartilhado (rodar uma vez no Supabase)
├── public/
├── src/
│   ├── components/
│   │   └── QrScanner.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Scanner.jsx
│   │   ├── History.jsx
│   │   └── NoteDetail.jsx
│   ├── services/
│   │   ├── nfceScraperService.js   # Lê a nota real via WebView embutida (Capacitor)
│   │   ├── sefazService.js         # Ponto de entrada usado pelas telas
│   │   ├── storageService.js       # Histórico local (Dexie) + sync com Supabase
│   │   ├── supabaseClient.js
│   │   ├── productNormalization.js # Normaliza nomes de produto para comparar entre notas
│   │   └── csvService.js
│   ├── App.jsx
│   ├── index.jsx
│   └── styles.css
├── capacitor.config.ts
└── package.json
```

## Tecnologias
- **React** (Create React App)
- **Capacitor** — empacota o app React num app Android real
- **@capgo/capacitor-inappbrowser** — WebView embutida usada para ler a página real da SEFAZ
- **html5-qrcode** — leitura do QR code pela câmera
- **Dexie.js** — histórico pessoal local (IndexedDB)
- **Supabase (Postgres)** — acervo compartilhado de preços

## Configuração do ambiente de desenvolvimento

1. Instale as dependências:
   ```
   npm install
   ```
2. Copie `.env.example` para `.env` e preencha com os dados do seu projeto Supabase
   (crie uma conta grátis em supabase.com, depois rode `supabase/schema.sql` no SQL Editor
   do seu projeto).
3. Gere o build web e sincronize com o projeto Android:
   ```
   npm run build
   npx cap sync android
   ```
4. Compile o app (precisa de JDK 17 e Android SDK configurados — ver `android/local.properties`):
   ```
   cd android
   ./gradlew assembleDebug
   ```
   O APK fica em `android/app/build/outputs/apk/debug/app-debug.apk`. Instale no celular via
   USB (`adb install`) ou copiando o arquivo.

## Limitações atuais
- Só o estado do **RJ** tem o scraper implementado (`src/services/nfceScraperService.js`).
  Outros estados usam portais diferentes e ainda não foram mapeados.
- O parser do texto da página da SEFAZ-RJ ainda não foi validado contra uma consulta real
  renderizada (o ambiente de desenvolvimento é bloqueado pelo filtro de IP da SEFAZ). Precisa
  de ajuste fino no primeiro teste em um celular real.
- Comparador de preços (lista de compras) ainda não implementado.
- iPhone não compila sem acesso a um Mac com Xcode.
