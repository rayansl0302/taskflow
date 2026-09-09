interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="pagination" aria-label="Paginação">
      <button
        type="button"
        className="btn btn--ghost btn--sm"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
      >
        Anterior
      </button>
      {pages.map((item) => (
        <button
          key={item}
          type="button"
          className={`pagination__page${item === page ? ' is-active' : ''}`}
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
      <button
        type="button"
        className="btn btn--ghost btn--sm"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
      >
        Próxima
      </button>
    </nav>
  );
}
