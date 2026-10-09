import { Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { useAuth } from './context/AuthContext'

import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import ArticlePage from './pages/ArticlePage'
import AddArticlePage from './pages/AddArticlePage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import ProfilePage from './pages/ProfilePage'
import EditArticlePage from './pages/EditArticlePage'

function App() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div>
            <header className="navbar">
                <div className="container navbarInner">
                    <div className="brand">
                        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="brandMark">UT</div>
                        </Link>
                        <div className="brandText">
                            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="brandTitle">UT Article Platform</div>
                            </Link>
                            <div className="brandSubtitle">Share & explore academic articles</div>
                        </div>
                    </div>

                    <nav className="navLinks">
                        <NavLink to="/" end className={({ isActive }) => `navLink${isActive ? ' navLinkActive' : ''}`}> 
                            Home
                        </NavLink>
                        
                        {user ? (
                            <>
                                <NavLink to="/add-article" className={({ isActive }) => `navLink${isActive ? ' navLinkActive' : ''}`}>
                                    Submit
                                </NavLink>
                                <NavLink to="/profile" className={({ isActive }) => `navLink${isActive ? ' navLinkActive' : ''}`}>
                                    Profile
                                </NavLink>
                                <button className="navLink" onClick={handleLogout} style={{ background: 'transparent', cursor: 'pointer' }}>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/signup" className={({ isActive }) => `navLink${isActive ? ' navLinkActive' : ''}`}>
                                    Sign Up
                                </NavLink>
                                <NavLink to="/login" className={({ isActive }) => `navLink${isActive ? ' navLinkActive' : ''}`}>
                                    Login
                                </NavLink>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main className="container page">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/article/:id" element={<ArticlePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />

                    <Route path="/add-article" element={<ProtectedRoute><AddArticlePage /></ProtectedRoute>} />
                    <Route path="/edit-article/:id" element={<ProtectedRoute><EditArticlePage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                </Routes>
            </main>

            <ToastContainer position="bottom-right" />
        </div>
    )
}

export default App