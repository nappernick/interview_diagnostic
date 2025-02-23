import React, { useEffect, useState } from "react";
import { fetchDiagnosticReport, DiagnosticReport } from "../api";

const DiagnosticReportComponent: React.FC = () => {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    fetchDiagnosticReport()
      .then((data) => setReport(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading diagnostic report...</div>;
  if (!report) return <div>No report available.</div>;

  return (
    <div style={{ margin: "20px" }}>
      <h2>Diagnostic Report</h2>
      <div>
        <h3>Coding Challenges</h3>
        <p>
          Passed: {report.coding.passed} / {report.coding.total} (
          {report.coding.percentage.toFixed(2)}%)
        </p>
      </div>
      <div>
        <h3>System Design</h3>
        <p>
          Score: {report.design.score} / {report.design.total} (
          {report.design.percentage.toFixed(2)}%)
        </p>
      </div>
      <div>
        <h3>Overall Recommendation</h3>
        <p>{report.overall_recommendation}</p>
      </div>
    </div>
  );
};

export default DiagnosticReportComponent;
