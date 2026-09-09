import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { initials } from '../utils/format';

export function AppLayout() {
  const { profile, logout, isAdmin } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    success('Sessão encerrada.');
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar${menuOpen ? ' is-open' : ''}`}>
        <div className="sidebar__brand">
          <span className="sidebar__logo">TF</span>
          <div>
            <strong>TaskFlow</strong>
            <small>Gestão de tarefas</small>
          </div>
        </div>

        <nav className="sidebar__nav">
          <NavLink to="/dashboard" className="sidebar__link" onClick={() => setMenuOpen(false)}>
            Dashboard
          </NavLink>
          <NavLink to="/tasks" className="sidebar__link" onClick={() => setMenuOpen(false)}>
            Tarefas
          </NavLink>
          {isAdmin && (
            <NavLink to="/users" className="sidebar__link" onClick={() => setMenuOpen(false)}>
              Usuários
            </NavLink>
          )}
          <NavLink to="/profile" className="sidebar__link" onClick={() => setMenuOpen(false)}>
            Meu perfil
          </NavLink>
        </nav>

        <div className="sidebar__footer">
          <span className="tag">{profile?.role === 'ADMIN' ? 'Administrador' : 'Usuário'}</span>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <button
            type="button"
            className="topbar__menu"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Abrir menu"
          >
            ☰
          </button>
          <div className="topbar__user">
            <span className="avatar">{initials(profile?.name || '?')}</span>
            <div className="topbar__identity">
              <strong>{profile?.name}</strong>
              <small>{profile?.email}</small>
            </div>
            <button type="button" className="btn btn--ghost btn--sm" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
