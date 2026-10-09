import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'

function truncateWords(text, maxWords) {
    if (!text) {
        return ''
    };
    const words = text.trim().split(/\s+/);
    if (words.length > maxWords) {
        return words.slice(0, maxWords).join(' ') + '...';
    }
    return text;
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function Highlight({ text, query }) {
    const phrase = (query || '').trim();

    if (!phrase) {
        return text;
    }

    const pattern = escapeRegex(phrase);
    const re = new RegExp(`(${pattern})`, 'gi')

    if (!re.test(text)) {
        return text
    }
    re.lastIndex = 0

    const parts = text.split(re)
    return (
        <>
            {parts.map((part, index) => {
                const isMatch = re.test(part)
                re.lastIndex = 0
                if (isMatch) {
                    return (<mark key={index} className="hl">{part}</mark>)
                }
                return <span key={index}>{part}</span>
            })}
        </>
    )
}

export default function HomePage() {
    const [articles, setArticles] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('date')
    const [isLoading, setIsLoading] = useState(false)

    const highlightQuery = searchQuery.trim()

    const loadArticles = async () => {
        setIsLoading(true)
        try {
            const response = await axios.get('/api/articles', {params: { query: searchQuery, sortBy: sortBy }})
            setArticles(response.data)
        }
        catch (error) {
            console.error(error)
            toast.error('Failed to load articles.')
        }
        finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadArticles()
    }, [sortBy])

    // useEffect(() => {
    //     const delay = 500;
    //     const searchTimeout = setTimeout(() => {loadArticles()}, delay)
    //     return () => clearTimeout(searchTimeout)
    // }, [searchQuery])

    const handleSearch = (e) => {
        e.preventDefault()
        loadArticles()
    }

    return (
        <div>
            <h1 className="pageTitle">Home</h1>
            <p className="pageSubtitle">
                A platform to share your ideas and discover insightful articles from others.
            </p>

            <div className="card">
                <div className="cardBody">
                    <div className="toolbar">
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10 }}>
                            <div className="searchWrapper">
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="Search title or summary..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ paddingRight: '32px' }} 
                                />
                                {searchQuery && (<button type="button" className="clearSearchBtn" onClick={() => setSearchQuery('')} title="Clear search">✕</button>)}
                            </div>
                            <button className="btn btnPrimary" type="submit">
                                Search
                            </button>
                        </form>

                        <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="date">Sort by Publication Date</option>
                            <option value="refs">Sort by Most Referenced</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style={{ height: 14 }} />

            <div className="stack">
                {articles.length === 0 && (
                    <div className="card">
                        <div className="cardBody muted">No articles found.</div>
                    </div>
                )}

                {articles.map((article) => (
                    <div key={article.id} className="card">
                        <div className="cardBody">
                            <h2 className="cardTitle">
                                <Link to={`/article/${article.id}`}>
                                    <Highlight text={article.title} query={highlightQuery} />
                                </Link>
                            </h2>

                            <div className="metaRow">
                                <span>Author: {article.author}</span>
                                <span>Published: {new Date(article.publishTime).toLocaleString()}</span>
                                <span>References to this article: {article.referenceCount}</span>
                            </div>

                            <p className="muted" style={{ margin: 0 }}>
                                <Highlight text={article.summary} query={highlightQuery} />
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}