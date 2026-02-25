from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Initialize the FastAPI application
app = FastAPI()

# Input validation model using Pydantic
class ResumeRequest(BaseModel):
    resume_text: str = Field(..., description="The raw text extracted from the resume")
    role: str = Field(..., description="The target job role to evaluate against")

# Dictionary holding role requirements and descriptions
roles_data = {
    "Backend Developer": {
        "skills": [
            "Java", "Spring Boot", "REST", 
            "MySQL", "Docker", "Git", "Microservices",
            "Python", "AWS", "Kubernetes"
        ],
        "description": """
        Backend Developer should know Java, Spring Boot,
        REST APIs, MySQL, Docker, Git, Microservices, Python, AWS, and Kubernetes.
        We are looking for strong system design principles and database management.
        """
    },
    "Frontend Developer": {
        "skills": [
            "HTML", "CSS", "JavaScript", "React",
            "Redux", "TypeScript", "Tailwind", "Vite"
        ],
        "description": """
        Frontend Developer should be proficient in HTML, CSS, JavaScript, React, 
        Redux, TypeScript, and modern build tools like Vite. Experience with UI libraries 
        like Tailwind CSS is a huge plus.
        """
    },
    "Full Stack Developer": {
        "skills": [
            "JavaScript", "React", "Node.js", "Express", 
            "MongoDB", "SQL", "Git", "Docker", "AWS"
        ],
        "description": """
        Full Stack Developer requires expertise across the stack. Key skills include 
        JavaScript, React, Node.js, Express, databases like MongoDB and SQL, along 
        with version control (Git) and deployment (Docker, AWS).
        """
    },
    "Data Scientist": {
        "skills": [
            "Python", "R", "SQL", "Machine Learning",
            "Pandas", "Scikit-Learn", "TensorFlow", "Data Visualization"
        ],
        "description": """
        Data Scientist should be an expert in Python or R for data analysis. 
        Requires strong SQL skills, experience with Machine Learning models using 
        Scikit-Learn or TensorFlow, and manipulating data with Pandas.
        """
    }
}

@app.post("/analyze")
def analyze_resume(data: ResumeRequest):
    """
    Analyzes an uploaded resume against a target role configuration.
    Returns the matching skills, missing skills, and context similarity score.
    """
    resume_text = data.resume_text
    role = data.role

    # Validate the submitted role exists in our configuration
    if role not in roles_data:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid target role: '{role}'. Available roles: {list(roles_data.keys())}"
        )

    role_info = roles_data[role]

    # ==========================================
    # 1. Skill Gap Detection (Keyword Matching)
    # ==========================================
    present = []
    missing = []
    
    # Lowercase resume text once to optimize matching
    resume_text_lower = resume_text.lower()

    # Iterate through required skills for the role and check presence in the resume
    for skill in role_info["skills"]:
        if skill.lower() in resume_text_lower:
            present.append(skill)
        else:
            missing.append(skill)

    # Calculate percentage of required skills found (prevent divide-by-zero)
    total_skills = len(role_info["skills"])
    if total_skills > 0:
        match_percentage = round((len(present) / total_skills) * 100, 2)
    else:
        match_percentage = 0.0

    # ==========================================
    # 2. Contextual Similarity (TF-IDF & Cosine)
    # ==========================================
    documents = [resume_text, role_info["description"]]
    vectorizer = TfidfVectorizer()
    
    try:
        # Convert documents into TF-IDF feature vectors
        tfidf_matrix = vectorizer.fit_transform(documents)
        
        # Calculate cosine similarity between resume (index 0) and description (index 1)
        similarity = cosine_similarity(
            tfidf_matrix[0:1], tfidf_matrix[1:2]
        )[0][0]
        
        similarity_score = round(similarity * 100, 2)
    except ValueError:
        # Failsafe if the document list is empty, contains only stop words, etc.
        similarity_score = 0.0

    # Return the structured analysis results
    return {
        "present_skills": present,
        "missing_skills": missing,
        "skill_match_percentage": match_percentage,
        "similarity_score": similarity_score
    }