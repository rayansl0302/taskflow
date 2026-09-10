/**
 * Mostrada quando a conta responsável consegue ler a coleção `internal`, mas o
 * gabarito ainda não foi publicado no projeto. Diferente do 404, aqui vale
 * dizer exatamente o que falta — quem chega nesta tela é quem administra o
 * desafio.
 */
export function GabaritoEmpty({ email }: { email: string | null }) {
  return (
    <div className="gab gab--single">
      <header className="gab__bar">
        <div>
          <strong>Gabarito interno — TaskFlow</strong>
          <small>{email ? `autenticado como ${email}` : 'conta responsável'}</small>
        </div>
      </header>

      <article className="gab__detail">
        <h1 className="gab__empty-title">O gabarito ainda não foi publicado neste projeto</h1>
        <p>
          Sua conta tem permissão de leitura — as regras do Firestore estão corretas —, mas o
          documento <code>internal/qa-gabarito</code> ainda não existe.
        </p>

        <section className="gab__block">
          <h2>Como publicar</h2>
          <p>
            Preencha <code>GABARITO_OWNER_PASSWORD</code> no <code>.env</code> e rode, na raiz
            do projeto:
          </p>
          <pre className="gab__command">npm run setup:remote</pre>
          <p className="muted">
            O script publica o gabarito, cria as contas de demonstração e carrega as tarefas.
            Recarregue esta página quando ele terminar.
          </p>
        </section>
      </article>
    </div>
  );
}
