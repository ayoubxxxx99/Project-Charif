import { useState } from 'react';
import axios from 'axios';
import './ApplicationForm.css';

const ApplicationForm = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        massar_code: '',
        last_year_grade: ''
    });
    const [status, setStatus] = useState({ type: '', msg: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'info', msg: 'Sending...' });

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/apply', formData);
            setStatus({ type: 'success', msg: response.data.message });
        } catch (error) {
            // This captures the validation errors we set up in Laravel!
            const errorMsg = error.response?.data?.message || "Check your connection";
            setStatus({ type: 'error', msg: errorMsg });
        }
    };

    return (
        <div className="form-container">
            <h2>Inscription - Charif Idrissi</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Nom Complet" required
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
                
                <input type="text" placeholder="Code Massar" required
                    onChange={(e) => setFormData({...formData, massar_code: e.target.value})} />
                
                <input type="number" step="0.01" placeholder="Note (Ex: 15.50)" required
                    onChange={(e) => setFormData({...formData, last_year_grade: e.target.value})} />
                
                <button type="submit">Envoyer Candidature</button>
            </form>
            {status.msg && <p className="status-msg" style={{color: status.type === 'error' ? 'red' : 'green'}}>{status.msg}</p>}
        </div>
    );
};

export default ApplicationForm;