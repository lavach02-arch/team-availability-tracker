import './Navbar.css';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navbar({ connected }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [loc.pathname]);

  const links = [
    { to:'/',         label:'Dashboard'  },
    { to:'/members',  label:'Members'    },
    { to:'/activity', label:'Activity'   },
    { to:'/about',    label:'About'      },
  ];

  return (
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav__inner">
        <Link to="/" className="nav__brand">
          <span className="nav__icon">👥</span>
          <span className="nav__title">TeamTrack</span>
          <span className="nav__pill">Live</span>
        </Link>

        <ul className="nav__links">
          {links.map(l => (
            <li key={l.to}>
              <Link to={l.to} className={`nav__link ${loc.pathname===l.to?'nav__link--active':''}`}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav__right">
          <span className={`nav__ws ${connected ? 'nav__ws--on' : 'nav__ws--off'}`}>
            <span className="nav__ws-dot" />
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>

        <button className={`nav__burger ${menuOpen?'nav__burger--open':''}`}
                onClick={() => setMenuOpen(p=>!p)}>
          <span /><span /><span />
        </button>
      </div>

      <div className={`nav__drawer ${menuOpen?'nav__drawer--open':''}`}>
        {links.map(l => (
          <Link key={l.to} to={l.to}
                className={`nav__drawer-link ${loc.pathname===l.to?'nav__drawer-link--active':''}`}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
