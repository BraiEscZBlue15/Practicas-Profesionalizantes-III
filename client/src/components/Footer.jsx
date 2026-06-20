import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer container">
            <div className="footer-content">
                <div className="footer-brand">
                    <Link to="/" className="logo">
                        <i className="ph ph-bank logo-icon"></i>
                        <span className="logo-text">Jefatura Distrital San Miguel</span>
                    </Link>
                    <p className="copyright">&copy; 2024 Jefatura Distrital San Miguel. The Academic Curator.</p>
                </div>
                <div className="footer-links">
                    <a href="#">Privacidad</a>
                    <a href="#">Contacto</a>
                    <a href="#">Mapa del Sitio</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
