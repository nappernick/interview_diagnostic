import React, { useEffect, useState, JSX } from "react";
import { fetchDesignQuestions, submitDesignAnswers, DesignQuestion } from "../api";

interface Response {
  question_id: string;
  selected_option: string;
}

const SystemDesign: React.FC = () => {
  const [questions, setQuestions] = useState<DesignQuestion[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDesignQuestions()
      .then((data) => {
        const designQuestions = data || [];
        setQuestions(designQuestions);
        setError(null);
      })
      .catch((err) => {
        console.error('Error fetching design questions:', err);
        setError('Failed to load design questions. Please try again.');
      });
  }, []);

  const handleOptionChange = (questionId: string, selected: string) => {
    setResponses((prev) => {
      const other = prev.filter((r) => r.question_id !== questionId);
      return [...other, { question_id: questionId, selected_option: selected }];
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await submitDesignAnswers(responses);
      setResult(res);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  if (questions.length === 0) return <div>Loading design questions...</div>;

  return (
    <div style={{ margin: "20px", maxWidth: "800px", marginLeft: "auto", marginRight: "auto" }}>
      <h2 style={{ textAlign: "center" }}>System Design Questions</h2>
      <div style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.1)", padding: "20px" }}>
        {questions.map((q) => (
          <div key={q.id} style={{ marginBottom: "40px" }}>
            <h3 style={{ color: "#333" }}>{q.title} ({q.difficulty})</h3>
            <p style={{ marginBottom: "15px" }}>
              <strong style={{ color: "#666" }}>Context: </strong>
              {q.context}
            </p>

            {q.requirements && (
              <>
                {q.requirements.functional && q.requirements.functional.length > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <strong>Functional Requirements:</strong>
                    <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
                      {q.requirements.functional.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {q.requirements.non_functional && q.requirements.non_functional.length > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <strong>Non-functional Requirements:</strong>
                    <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
                      {q.requirements.non_functional.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* If old-style question has options, render them as radio buttons */}
            {(!q.phases || q.phases.length === 0) && q.options && (
              <div style={{ marginTop: "20px" }}>
                <p style={{ fontWeight: "bold" }}>Possible Approaches:</p>
                {q.options.map((opt, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: "10px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "4px",
                      padding: "8px"
                    }}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      onChange={() => handleOptionChange(q.id, opt)}
                      style={{ marginRight: "10px" }}
                    />
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            style={{
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {loading ? "Submitting..." : "Submit Design Answers"}
          </button>
        </div>

        {result && (
          <div style={{ 
            marginTop: "30px", 
            padding: "20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "4px"
          }}>
            <h4 style={{ color: "#444" }}>Design Score / Results:</h4>
            <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemDesign;
