import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import './RuleManagement.css';

const RuleManagement = () => {
    const [rules, setRules] = useState([]);
    const [editingRule, setEditingRule] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { register, handleSubmit, reset, setValue } = useForm();

    // Fetch all rules
    useEffect(() => {
        const fetchRules = async () => {
            setIsLoading(true);
            try {
                console.log("going to rules");
                const response = await axios.get('/rules');
                setRules(response.data);
            } catch (err) {
                setError('Failed to fetch rules');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRules();
    }, []);

    // Handle form submission (create/update)
    const onSubmit = async (data) => {
        try {
            let response;
            if (editingRule) {
                // Update existing rule
                response = await axios.put(`/rules/${editingRule._id}`, data);
                setRules(rules.map(rule => 
                    rule._id === editingRule._id ? response.data : rule
                ));
            } else {
                // Create new rule
                response = await axios.post('/rules', data);
                setRules([response.data, ...rules]);
            }
            resetForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
            console.error(err);
        }
    };

    // Edit a rule
    const handleEdit = (rule) => {
        setEditingRule(rule);
        setValue('ruleName', rule.ruleName);
        setValue('description', rule.description);
        setValue('isActive', rule.isActive);
        // Set other fields as needed
    };

    // Delete a rule
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this rule?')) {
            try {
                await axios.delete(`/rules/${id}`);
                setRules(rules.filter(rule => rule._id !== id));
                if (editingRule && editingRule._id === id) {
                    resetForm();
                }
            } catch (err) {
                setError('Failed to delete rule');
                console.error(err);
            }
        }
    };

    // Reset form
    const resetForm = () => {
        reset();
        setEditingRule(null);
        setError('');
    };

    return (
        <div className="rule-management">
            <h2>Rule Management</h2>
            
            {/* Rule Form */}
            <div className="rule-form">
                <h3>{editingRule ? 'Edit Rule' : 'Add New Rule'}</h3>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label>Rule Name</label>
                        <input 
                            {...register('ruleName', { required: 'Rule name is required' })}
                            type="text" 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Description</label>
                        <textarea 
                            {...register('description')}
                            rows="3"
                        />
                    </div>
                    
                    <div className="form-group checkbox">
                        <label>
                            <input 
                                {...register('isActive')}
                                type="checkbox" 
                            /> Active
                        </label>
                    </div>
                    
                    {/* Add more fields for parameters as needed */}
                    
                    <div className="form-actions">
                        <button type="submit" className="btn-primary">
                            {editingRule ? 'Update Rule' : 'Add Rule'}
                        </button>
                        {editingRule && (
                            <button type="button" onClick={resetForm} className="btn-secondary">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
                {error && <div className="error-message">{error}</div>}
            </div>
            
            {/* Rules List */}
            <div className="rules-list">
                <h3>Existing Rules</h3>
                {isLoading ? (
                    <div>Loading rules...</div>
                ) : rules.length === 0 ? (
                    <div>No rules found</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Rule Name</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rules.map(rule => (
                                <tr key={rule._id}>
                                    <td>{rule.ruleName}</td>
                                    <td>{rule.description || '-'}</td>
                                    <td>
                                        <span className={`status ${rule.isActive ? 'active' : 'inactive'}`}>
                                            {rule.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => handleEdit(rule)}
                                            className="btn-edit"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(rule._id)}
                                            className="btn-delete"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default RuleManagement;