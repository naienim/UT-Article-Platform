import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Calendar, Link2, BookOpen, User2, Edit3, Trash2, AlertTriangle } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function ArticlePage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth() 

    const [article, setArticle] = useState(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const loadArticle = async () => {
            try {
                const response = await axios.get(`/api/articles/${id}`)
                setArticle(response.data)
            }
            catch (error) {
                toast.error(error.response?.data?.error || "Article not found")
                navigate(-1)
            }
        }
        loadArticle()
    }, [id, navigate])

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await axios.delete(`/api/articles/${id}`)
            toast.success("Article deleted successfully")
            navigate('/profile')
        } 
        catch (error) {
            toast.error(error.response?.data?.error || "Failed to delete article")
            setIsDeleting(false)
            setIsDeleteModalOpen(false)
        }
    }

    if (!article) {
        return (
            <div className="articleWrapper" style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
                Loading article...
            </div>
        )
    }

    const authorInitial = article.author ? article.author.charAt(0) : '?'
    const isAuthor = user && user.username === article.author;
    const formattedDate = new Date(article.publishTime).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})

    return (
        <div className="articleWrapper">
            {/* <button onClick={() => navigate(-1)} className="backLink" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <ArrowLeft size={18} /> Back to articles
            </button> */}

            <article>
                <header className="articleHeader">
                    <h1 className="pageTitle">{article.title}</h1>
                    
                    <div className="metaContainer">
                        <div className="articleMetaInfo">
                            {/* <div className="metaItem">
                                <div className="authorAvatarSmall">{authorInitial}</div>
                                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{article.author}</span>
                            </div> */}
                            <div className="metaItem">
                                <User2   size={16} />
                                {article.author}
                            </div>
                            <div className="metaItem">
                                <Calendar size={16} />
                                {formattedDate}
                            </div>
                            <div className="metaItem">
                                <Link2 size={16} />
                                {article.referenceCount} {article.referenceCount === 1 ? 'Citation' : 'Citations'}
                            </div>
                        </div>

                        {isAuthor && (
                            <div className="articleActions">
                                <button className="btn btnPrimary btnSmall" onClick={() => navigate(`/edit-article/${article.id}`)}>
                                    <Edit3 size={14} /> Edit
                                </button>
                                <button className="btn btnDanger btnSmall" onClick={() => setIsDeleteModalOpen(true)}>
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <div className="articleAbstract">
                    <strong style={{ display: 'block', marginBottom: 8, fontStyle: 'normal' }}>Abstract</strong>
                    {article.summary}
                </div>

                <div className="articleBodyText">
                    {article.body}
                </div>
            </article>

            {article.references && article.references.length > 0 && (
                <section className="referencesSection">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 22 }}>
                        <BookOpen size={24} className="muted" />
                        Referenced Articles
                    </h3>
                    <div>
                        {article.references.map((ref) => (
                            <Link to={`/article/${ref.id}`} key={ref.id} style={{ textDecoration: 'none' }}>
                                <div className="referenceCard">
                                    <span style={{ fontWeight: 600, color: 'var(--link-color)', fontSize: 16 }}>
                                        {ref.title}
                                    </span>
                                    <span className="muted" style={{ fontSize: 13, marginTop: 6 }}>
                                        {/* By {ref.author} • {ref.referenceCount} {ref.referenceCount === 1 ? 'Citation' : 'Citations'} */}
                                        <span> By {ref.author} • </span> 
                                        <span> Published {new Date(ref.publishTime).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} • </span> 
                                        <span> {ref.referenceCount} {ref.referenceCount === 1 ? 'Citation' : 'Citations'} </span>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {isDeleteModalOpen && (
                <div className="modalOverlay" onClick={() => setIsDeleteModalOpen(false)}>
                    <div className="modalContent" onClick={(e) => e.stopPropagation()}>                        
                        <div className="modalIconWrapper">
                            <AlertTriangle size={48} color="var(--danger)" strokeWidth={2.5} />
                        </div>                        
                        <h3 className="modalTitle">
                            Delete Article
                        </h3>
                        
                        <p className="modalText">
                            Are you sure you want to delete this article? This action cannot be undone and will remove it from the platform.
                        </p>
                        
                        <div className="modalActions">
                            <button className="btn" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
                                Cancel
                            </button>
                            <button className="btn btnDanger" onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}