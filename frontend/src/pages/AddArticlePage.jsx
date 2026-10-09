import { createSelectStyles } from '../styles/reactSelectStyles'
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Select from 'react-select'
import axios from 'axios'

export default function AddArticlePage() {
    const navigate = useNavigate()
    const [availableArticles, setAvailableArticles] = useState([])
    const [title, setTitle] = useState('')
    const [summary, setSummary] = useState('')
    const [body, setBody] = useState('')
    const [selectedRefOptions, setSelectedRefOptions] = useState([])

    const loadArticles = async () => {
        try {
            const response = await axios.get('/api/articles', {params: { sortBy: 'date' }})
            setAvailableArticles(response.data)
        } 
        catch (error) {
            console.error(error)
            toast.error('Failed to load articles for references')
        }
    }

    useEffect(() => {
        loadArticles()
    }, [])

    const referenceOptions = useMemo(() => {
        return availableArticles.map((article) => ({ value: article.id, label: article.title }))
    }, [availableArticles]);

    const selectStyles = useMemo(() => {
        return createSelectStyles()
    }, [])

    const handleSubmit = async (submitEvent) => {
        submitEvent.preventDefault()
        const referenceIds = selectedRefOptions.map((reference) => reference.value)
        try {
            await axios.post('/api/articles', { title, summary, body, referenceIds })
            toast.success('Article published successfully!')
            navigate('/')
        }
        catch (error) {
            toast.error(error.response?.data?.error || 'Failed to submit article')
        }
    }

    return (
        <div className="stack">
            <div>
                <h1 className="pageTitle">Submit New Article</h1>
                <p className="pageSubtitle">
                    Bring your ideas to life and share them with others around the world.
                </p>
            </div>

            <div className="card">
                <div className="cardBody">
                    <form onSubmit={handleSubmit} className="formGrid">
                        <div>
                            <label className="label">Title</label>
                            <input
                                className="input"
                                type="text"
                                value={title}
                                onChange={(submitEvent) => setTitle(submitEvent.target.value)}
                                required
                                placeholder="Unique article title..."
                            />
                        </div>

                        <div>
                            <label className="label">Summary</label>
                            <textarea
                                className="textarea"
                                value={summary}
                                onChange={(submitEvent) => setSummary(submitEvent.target.value)}
                                required
                                rows={7}
                                placeholder="Short summary of article..."
                            />
                        </div>

                        <div>
                            <label className="label">Body</label>
                            <textarea
                                className="textarea"
                                value={body}
                                onChange={(submitEvent) => setBody(submitEvent.target.value)}
                                required
                                rows={12}
                                placeholder="Full article content..."
                            />
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
                            <button className="btn btnPrimary" type="submit">
                                Publish Article
                            </button>
                            <button className="btn" type="button" onClick={() => navigate('/')}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}