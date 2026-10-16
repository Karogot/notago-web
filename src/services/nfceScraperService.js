// Leitura real da nota fiscal (NFC-e) através de uma WebView nativa embutida no app.
//
// Por que não é um simples fetch(): a SEFAZ bloqueia por reputação de IP qualquer acesso
// vindo de servidores/nuvem (confirmado em testes manuais com chaves reais do RJ). A consulta
// só funciona a partir do IP real do celular do usuário, então o fetch tem que acontecer dentro
// do próprio app (Capacitor), usando o plugin InAppBrowser para abrir a página oficial da SEFAZ
// numa WebView oculta e ler o conteúdo renderizado via JavaScript injetado no mesmo processo
// (sem os bloqueios de CORS/cross-origin que uma aba comum do navegador teria).
import { InAppBrowser } from '@capgo/capacitor-inappbrowser';

const WEBVIEW_TIMEOUT_MS = 25000;

// Script injetado dentro da página real da SEFAZ. Lê o texto renderizado e manda de volta
// para o app via window.mobileApp.postMessage (ponte do plugin).
const EXTRACTOR_SCRIPT = `
(() => {
  try {
    const text = document.body ? document.body.innerText : '';
    window.mobileApp.postMessage({ detail: { ok: true, text } });
  } catch (e) {
    window.mobileApp.postMessage({ detail: { ok: false, error: String(e) } });
  }
})();
`;

// Mapa de código de UF (2 primeiros dígitos da chave de acesso) -> scraper daquele estado.
// Hoje só o RJ está implementado; outros estados exigem descobrir a URL/layout de cada um.
const STATE_SCRAPERS = {
  '33': { name: 'RJ', buildUrl: buildRJUrl, parse: parseRJText },
};

export function getStateFromAccessKey(accessKey) {
  const cUF = accessKey.slice(0, 2);
  return STATE_SCRAPERS[cUF]?.name || null;
}

function buildRJUrl(accessKey) {
  // Formato padrão nacional do QR code de NFC-e: p=<chave>|<versao>|<tpAmb>|<cIdToken>
  // tpAmb=1 é produção (o que interessa para notas reais).
  return `https://www.fazenda.rj.gov.br/nfce/consulta?p=${accessKey}|2|1|1`;
}

async function readPageViaHiddenWebView(url) {
  return new Promise((resolve, reject) => {
    let listenerHandle;
    let webviewId;
    let settled = false;

    const finish = async (fn, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (listenerHandle) {
        try { await listenerHandle.remove(); } catch (_) { /* ignore */ }
      }
      if (webviewId) {
        try { await InAppBrowser.close({ id: webviewId }); } catch (_) { /* ignore */ }
      }
      fn(value);
    };

    const timer = setTimeout(() => {
      finish(reject, new Error('Tempo esgotado ao consultar a SEFAZ. Tente novamente.'));
    }, WEBVIEW_TIMEOUT_MS);

    (async () => {
      try {
        listenerHandle = await InAppBrowser.addListener('messageFromWebview', (event) => {
          const detail = event?.detail ?? event;
          if (detail?.ok) {
            finish(resolve, detail.text || '');
          } else {
            finish(reject, new Error(detail?.error || 'Não foi possível ler a página da SEFAZ.'));
          }
        });

        const { id } = await InAppBrowser.openWebView({
          url,
          hidden: true,
          isPresentAfterPageLoad: true,
        });
        webviewId = id;

        // Pequena folga extra para páginas que completam renderização via AJAX
        // logo após o evento de "load" do documento.
        await new Promise((r) => setTimeout(r, 1200));

        await InAppBrowser.executeScript({ id, code: EXTRACTOR_SCRIPT });
      } catch (err) {
        finish(reject, err);
      }
    })();
  });
}

// Extrai CNPJ, nome do estabelecimento, valor total e itens do texto puro da página.
//
// IMPORTANTE: esses padrões ainda não foram validados contra uma consulta real renderizada
// (o ambiente de desenvolvimento é bloqueado pelo filtro de IP da SEFAZ, então não dá para ver
// o HTML/texto real da página de resultado). Precisa ser ajustado no primeiro teste em um
// celular de verdade — use `console.log(rawText)` temporariamente para inspecionar o formato
// recebido e corrigir as expressões regulares abaixo.
function parseRJText(rawText, accessKey) {
  if (!rawText || rawText.trim().length === 0) {
    throw new Error('A SEFAZ retornou uma página vazia para esta chave de acesso.');
  }

  const cnpjMatch = rawText.match(/(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/);
  const cnpj = cnpjMatch ? cnpjMatch[1] : null;

  // Nome do estabelecimento: heurística best-effort - primeira linha "importante" antes do CNPJ.
  let storeName = null;
  if (cnpjMatch) {
    const beforeCnpj = rawText.slice(0, cnpjMatch.index);
    const lines = beforeCnpj.split('\n').map((l) => l.trim()).filter(Boolean);
    storeName = lines.length > 0 ? lines[lines.length - 1] : null;
  }

  const totalMatch = rawText.match(/Valor\s+(?:a\s+pagar|total)[^\d]*([\d.,]+)/i);
  const totalValue = totalMatch ? parseBRNumber(totalMatch[1]) : null;

  // Itens: tenta casar linhas no formato "DESCRICAO  Qtde:X UN:Y  Vl.Unit:Z  Vl.Total:W"
  // (layout comum em DANFE-NFCe). Ajustar após o primeiro teste real.
  const items = [];
  const itemRegex = /([A-ZÀ-Ú0-9][A-ZÀ-Ú0-9 ,.\-/]{3,60}?)\s*\(?C[óo]d/gi;
  let match;
  while ((match = itemRegex.exec(rawText)) !== null) {
    items.push({ description: match[1].trim() });
  }

  return {
    id: accessKey,
    accessKey,
    storeName,
    cnpj,
    date: new Date().toISOString(),
    totalValue,
    items,
    rawText, // mantido temporariamente para depuração do parser no primeiro teste real
  };
}

function parseBRNumber(str) {
  if (!str) return null;
  const normalized = str.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(normalized);
  return Number.isNaN(n) ? null : n;
}

export async function fetchNfceData(accessKey) {
  const uf = getStateFromAccessKey(accessKey);
  if (!uf) {
    throw new Error(
      `Estado da nota (código ${accessKey.slice(0, 2)}) ainda não é suportado. Hoje só RJ funciona.`
    );
  }

  const scraper = STATE_SCRAPERS['33']; // único implementado por enquanto
  const url = scraper.buildUrl(accessKey);
  const rawText = await readPageViaHiddenWebView(url);
  return scraper.parse(rawText, accessKey);
}
