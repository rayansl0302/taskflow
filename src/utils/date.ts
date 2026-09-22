/** Converte o valor de um <input type="date"> para Date. */
export function parseDateInput(value: string): Date {
  return new Date(value);
}

/** Converte um Date para o formato aceito por <input type="date">. */
export function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return '';
  return date.toISOString().slice(0, 10);
}

/** Data no formato brasileiro (dd/mm/aaaa). */
export function formatDate(date: Date | null | undefined): string {
  if (!date) return '—';
  return date.toLocaleDateString('pt-BR');
}

/** Data e hora no formato brasileiro. */
export function formatDateTime(date: Date | null | undefined): string {
  if (!date) return '—';
  return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

/** Indica se a tarefa ja passou do prazo. */
export function isOverdue(dueDate: Date | null | undefined): boolean {
  if (!dueDate) return false;
  return dueDate.getTime() < Date.now();
}

/**
 * Hoje no formato de <input type="date">, no fuso do usuário.
 *
 * `toISOString()` devolveria a data em UTC — o que, à noite em fusos
 * negativos, já aponta para o dia seguinte e faria o prazo de hoje ser
 * recusado como se fosse passado.
 */
export function todayInputValue(): string {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
}
