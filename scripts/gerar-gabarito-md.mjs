/**
 * Gera o QA_GABARITO.md a partir de docs/gabarito.json.
 *
 * O JSON é a fonte da verdade — inclusive do acompanhamento dos ciclos de
 * teste (campo `status` de cada defeito). Este script não fala com o Firebase,
 * então roda sem service account e sem emulador.
 *
 *   node scripts/gerar-gabarito-md.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));

const STATUS_LABEL = {
  corrigido: 'Corrigido',
  parcial: 'Parcial',
  pendente: 'Pendente',
};

const SEVERIDADES = ['CRÍTICA', 'ALTA', 'MÉDIA', 'BAIXA'];

export function toMarkdown(data) {
  const bugs = data.bugs ?? [];
  const situacao = (bug) => (bug.status === 'encontrado' ? 'corrigido' : bug.status ?? 'pendente');
  const contar = (valor) => bugs.filter((bug) => situacao(bug) === valor).length;

  const corrigidos = contar('corrigido');
  const parciais = contar('parcial');
  const pendentes = contar('pendente');

  const lines = [];
  lines.push(`# ${data.titulo}`, '');
  lines.push('> **DOCUMENTO INTERNO. NÃO ENTREGAR AO PROFISSIONAL AVALIADO.**', '>');
  lines.push(`> ${data.descricao}`, '');
  lines.push(`**Total de defeitos inseridos: ${bugs.length}**`, '');

  if (corrigidos + parciais > 0) {
    lines.push(
      `**Acompanhamento:** ${corrigidos} corrigidos · ${parciais} ` +
        `${parciais === 1 ? 'parcial' : 'parciais'} · ${pendentes} pendentes · ` +
        `**${parciais + pendentes} ainda plantados** de ${bugs.length}`,
      '',
    );
  }

  if (Array.isArray(data.ciclos) && data.ciclos.length > 0) {
    lines.push('## Ciclos de teste executados', '');
    lines.push('| Ciclo | Responsável | Período | Ocorrências |');
    lines.push('|---|---|---|---:|');
    for (const ciclo of data.ciclos) {
      lines.push(
        `| ${ciclo.nome} | ${ciclo.responsavel} | ${ciclo.periodo} | ${ciclo.ocorrencias} |`,
      );
    }
    lines.push('');
  }

  lines.push('---', '');
  lines.push('## Índice', '');
  lines.push('| ID | Situação | Título | Área | Severidade | Dificuldade |');
  lines.push('|---|---|---|---|---|---|');
  for (const bug of bugs) {
    lines.push(
      `| ${bug.id} | ${STATUS_LABEL[situacao(bug)]} | ${bug.titulo} | ${bug.area} | ` +
        `${bug.severidade} | ${bug.dificuldade} |`,
    );
  }

  lines.push('', '### Distribuição por severidade', '');
  lines.push('| Severidade | Total | Ainda plantados |', '|---|---:|---:|');
  for (const nivel of SEVERIDADES) {
    const doNivel = bugs.filter((bug) => bug.severidade === nivel);
    const abertos = doNivel.filter((bug) => situacao(bug) !== 'corrigido').length;
    lines.push(`| ${nivel} | ${doNivel.length} | ${abertos} |`);
  }

  lines.push('', '---', '');

  for (const bug of bugs) {
    lines.push(`## ${bug.id} — ${bug.titulo}`, '');
    lines.push(
      `**Situação:** ${STATUS_LABEL[situacao(bug)]} · **Área:** ${bug.area} · ` +
        `**Severidade:** ${bug.severidade} · **Dificuldade:** ${bug.dificuldade}`,
      '',
    );
    if (bug.reporte) lines.push(`**Reportado pelo QA:** ${bug.reporte}`, '');
    if (bug.corrigidoEm) {
      lines.push(`**Corrigido em:** ${bug.corrigidoEm} — não está mais no sistema.`, '');
    }
    lines.push('**Por que acontece**', '', bug.porque, '');
    lines.push('**Onde está**', '');
    for (const local of bug.local) lines.push(`- \`${local}\``);
    lines.push('', '**Como reproduzir**', '');
    bug.passos.forEach((passo, index) => lines.push(`${index + 1}. ${passo}`));
    lines.push('', `**Resultado esperado:** ${bug.esperado}`, '');
    lines.push(`**Resultado atual:** ${bug.atual}`, '');
    if (bug.descoberta) lines.push(`**Como se chega nele:** ${bug.descoberta}`, '');
    if (bug.observacoes) lines.push(`**Observações:** ${bug.observacoes}`, '');
    lines.push('---', '');
  }

  return lines.join('\n');
}

function main() {
  const entrada = resolve(process.env.GABARITO_DATA || `${raiz}/docs/gabarito.json`);
  const saida = resolve(process.env.GABARITO_MD || `${raiz}/QA_GABARITO.md`);

  if (!existsSync(entrada)) {
    console.error(`\nGabarito não encontrado em "${entrada}".\n`);
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(entrada, 'utf8'));
  writeFileSync(saida, toMarkdown(data), 'utf8');
  console.log(`> ${data.bugs.length} defeitos escritos em ${saida}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main();
}
