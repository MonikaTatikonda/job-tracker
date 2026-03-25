import { useEffect, useState } from "react";

function RecentActivity() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchRecent();
  }, []);

  const fetchRecent = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("https://your-render-url.onrender.com/api/recent", {
      headers: {
        Authorization: token
      }
    });

    const data = await res.json();
    setJobs(data);
  };

  return (
    <div>
      <h3>Recent Activity</h3>
      {jobs.map(job => (
        <div key={job.jobId}>
          <p>{job.title}</p>
          <small>{job.company}</small>
        </div>
      ))}
    </div>
  );
}

export default RecentActivity;

