import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="logo" onClick={closeMenu}>
          ♻️ Sıfır Atık Takas
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Menüyü Aç/Kapat"
        >
          ☰
        </button>

        <nav className={menuOpen ? 'nav-links nav-links-open' : 'nav-links'}>
          <NavLink to="/" end onClick={closeMenu}>
            Ana Sayfa
          </NavLink>

          <NavLink to="/ilanlar" onClick={closeMenu}>
            İlanlar
          </NavLink>

          {user ? (
            <>
              <NavLink to="/ilan-ekle" onClick={closeMenu}>
                İlan Ekle
              </NavLink>

              <NavLink to="/favoriler" onClick={closeMenu}>
                Favoriler
              </NavLink>

              <NavLink to="/teklifler" onClick={closeMenu}>
                Teklifler
              </NavLink>

              <NavLink to="/ilanlarim" onClick={closeMenu}>
                İlanlarım
              </NavLink>

              <NavLink to="/profil" onClick={closeMenu}>
                Profil
              </NavLink>

              <NavLink to="/panel" onClick={closeMenu}>
                Panel
              </NavLink>

              {user?.role === 'admin' && (
                <NavLink to="/admin" onClick={closeMenu}>
                  Admin
                </NavLink>
              )}

              <button onClick={handleLogout} className="logout-btn">
                Çıkış
              </button>
            </>
          ) : (
            <>
              <NavLink to="/giris" onClick={closeMenu}>
                Giriş
              </NavLink>

              <NavLink to="/kayit" onClick={closeMenu}>
                Kayıt
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}