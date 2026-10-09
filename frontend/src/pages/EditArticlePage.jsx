import { createSelectStyles } from '../styles/reactSelectStyles'
import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Select from 'react-select'
import axios from 'axios'

export default function EditArticlePage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [availableArticles, setAvailableArticles] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    
    const [title, setTitle] = useState('')
    const [summary, setSummary] = useState('')
    const [body, setBody] = useState('')
    const [selectedRefOptions, setSelectedRefOptions] = useState([])

    const fetchInitialData = async () => {
        try {
            const articleRes = await axios.get(`/api/articles/${id}`)
            const article = articleRes.data
            
            setTitle(article.title)
            setSummary(article.summary)
            setBody(article.body)
            
            if (article.references) {
                setSelectedRefOptions(article.references.map(ref => ({
                    value: ref.id,
                    label: ref.title
                })))
            }

            const articlesRes = await axios.get('/api/articles', {params: { sortBy: 'date' }})
            setAvailableArticles(articlesRes.data)
        } 
        catch (error) {
            toast.error(error.response?.data?.error || "Failed to load article data")
            navigate('/')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchInitialData()
    }, [id, navigate])

    const referenceOptions = useMemo(() => {
        return availableArticles.filter(article => article.id !== parseInt(id)).map((article) => ({ value: article.id, label: article.title }))
    }, [availableArticles, id]);

    const selectStyles = useMemo(() => createSelectStyles(), [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const referenceIds = selectedRefOptions.map((ref) => ref.value)
        try {
            await axios.put(`/api/articles/${id}`, { title, summary, body, referenceIds })
            toast.success('Article updated successfully!')
            navigate(`/article/${id}`)
        }
        catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update article')
        }
    }

    if (isLoading) {
        return <div className="container" style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
    }

    return (
        <div className="stack">
            <div>
                <h1 className="pageTitle">Edit Your Article</h1>
                <p className="pageSubtitle">Refine your article's text, update key details and publish your changes.</p>
            </div>

            <div className="card">
                <div className="cardBody">
                    <form onSubmit={handleSubmit} className="formGrid">
                        <div>
                            <label className="label">Title</label>
                            <input className="input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Unique article title..." />
                        </div>
                        <div>
                            <label className="label">Summary</label>
                            <textarea className="textarea" value={summary} onChange={(e) => setSummary(e.target.value)} required rows={7} placeholder="Short summary of article..." />
                        </div>
                        <div>
                            <label className="label">Body</label>
                            <textarea className="textarea" value={body} onChange={(e) => setBody(e.target.value)} required rows={12} placeholder="Full article content..." />
                        </div>

                        <div>
                            <label className="label">References (optional)</label>
                            <div className="rs">
                                <Select
                                    classNamePrefix="rs"
                                    isMulti
                                    isClearable
                                    isSearchable
                                    options={referenceOptions}
                                    value={selectedRefOptions}
                                    onChange={(newValue) => setSelectedRefOptions(newValue || [])}
                                    placeholder="Search articles and select references"
                                    noOptionsMessage={() => 'No matching articles'}
                                    styles={selectStyles}
                                />
                            </div>

                            <div className="muted" style={{ fontSize: 13, marginTop: 6 }}></div>
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn btnPrimary" type="submit">Save Changes</button>
                            <button className="btn" type="button" onClick={() => navigate(`/article/${id}`)}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}