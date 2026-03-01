import { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css'; // Don't forget to import the CSS!

const AdminDashboard = () => {
    const [list, setList] = useState([]);

    const fetchApplications = () => {
        axios.get('http://127.0.0.1:8000/api/applications')
            .then(res => setList(res.data));
    };

    useEffect(() => { fetchApplications(); }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await axios.put(`http://127.0.0.1:8000/api/applications/${id}/status`, {
                status: newStatus
            });
            fetchApplications(); 
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>Lycée Charif Idrissi - Administration</h2>
                <span style={{color: '#64748b'}}>{list.length} Candidatures</span>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Candidat</th>
                        <th>Massar</th>
                        <th>Note</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map(student => (
                        <tr key={student.id}>
                            <td><strong>{student.full_name}</strong></td>
                            <td>{student.massar_code}</td>
                            <td>{student.last_year_grade}/20</td>
                            <td>
                                <span className={`status-badge status-${student.status}`}>
                                    {student.status}
                                </span>
                            </td>
                            <td>
                                <div className="btn-group">
                                    <button className="btn btn-accept" onClick={() => handleStatusUpdate(student.id, 'accepted')}>Accepter</button>
                                    <button className="btn btn-reject" onClick={() => handleStatusUpdate(student.id, 'rejected')}>Refuser</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;