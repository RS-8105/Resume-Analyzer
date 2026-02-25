import { useState } from 'react'
import './App.css'

// --- Reusable Components ---

const ProgressBar = ({ label, percentage, type }) => {
  return (
    <div className="metric-item">
      <div className="metric-header">
        <span className="metric-label">{label}</span>
        <span className="metric-value">{percentage}%</span>
      </div>
      <div className="progress-bar-container">
        <div 
          className={`progress-bar ${type}-bar`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

const SkillBadge = ({ skill, type }) => {
  const icon = type === 'present' ? '✓' : '✗'
  return (
    <span className={`badge ${type}`}>
      <span className="badge-icon">{icon}</span>
      {skill}
    </span>
  )
}

const ResultCard = ({ result }) => {
  if (!result) return null;

  return (
    <div className="result-card">
      <div className="result-header">
        <h3>Analysis Results</h3>
        <p>Here is how the resume aligns with the target role.</p>
      </div>
      
      <div className="metrics-section">
        <ProgressBar 
          label="Skill Match" 
          percentage={result.skill_match_percentage} 
          type="match" 
        />
        <ProgressBar 
          label="Context Score" 
          percentage={result.similarity_score} 
          type="sim" 
        />
      </div>

      <div className="skills-section">
        <div className="skill-group">
          <h4>Present Skills</h4>
          <div className="badges">
            {result.present_skills && result.present_skills.length > 0 ? (
              result.present_skills.map((skill, i) => (
                <SkillBadge key={`present-${i}`} skill={skill} type="present" />
              ))
            ) : (
              <span className="badge empty">None detected</span>
            )}
          </div>
        </div>
        
        <div className="skill-group">
          <h4>Missing Skills</h4>
          <div className="badges">
            {result.missing_skills && result.missing_skills.length > 0 ? (
              result.missing_skills.map((skill, i) => (
                <SkillBadge key={`missing-${i}`} skill={skill} type="missing" />
              ))
            ) : (
              <span className="badge empty">None missing</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Main Application ---

function App() {
  const [file, setFile] = useState(null)
  const [role, setRole] = useState('Backend Developer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload a resume first.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('role', role)

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setResult(data)
    } catch (err) {
      console.error('Error analyzing resume:', err)
      setError(err.message || 'Failed to analyze resume. Please check the backend connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-wrapper">
      <div className="container">
        <header className="header">
          <div className="header-badge">NLP Powered</div>
          <h1>AI Resume Skill Gap Analyzer</h1>
          <p>Analyze resume alignment with target job roles using NLP</p>
        </header>
        
        <main className="main-card">
          <div className="form-group row-group">
            <div className="input-group">
                <label>Target Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                </select>
            </div>
          </div>

          <div className="form-group">
            <label>Upload Resume (PDF)</label>
            <div className="file-input-wrapper">
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange} 
              />
              <div className={`file-input-text ${file ? 'has-file' : ''}`}>
                {file ? (
                  <>
                    <span className="file-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </span>
                    <span className="file-name">{file.name}</span>
                  </>
                ) : (
                  <>
                    <span className="upload-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </span>
                    <span>Click or Drag & Drop PDF</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {error && <div className="error-message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error}
          </div>}

          <button 
            className={`analyze-btn ${loading ? 'loading' : ''}`} 
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Analyzing...
              </>
            ) : 'Analyze Resume'}
          </button>
        </main>

        <ResultCard result={result} />
        
      </div>
    </div>
  )
}

export default App
