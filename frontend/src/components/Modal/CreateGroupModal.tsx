/**
 * Create Group Modal
 * 
 * Modal form for creating a new expense group.
 * 
 * API: POST /api/groups
 * Request Body:
 * - name (required): Group name
 * - description (optional): Group description
 * - currency (optional): 3-letter ISO currency code (defaults to INR)
 */

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Input, Button } from '@/components';
import { api, ApiException } from '@/services/api';
import './CreateGroupModal.css';

// ========================================
// TYPES
// ========================================

interface CreateGroupRequest {
    name: string;
    description?: string;
    currency: string;
    simplifyDebts: boolean;
}

interface CreateGroupResponse {
    groupId: string;
    name: string;
    description?: string;
    currency: string;
}

export interface CreateGroupModalProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Callback when modal should close */
    onClose: () => void;
    /** Callback when group is successfully created */
    onGroupCreated: (groupId: string) => void;
}

// ========================================
// COMPONENT
// ========================================

/**
 * CreateGroupModal handles the form and API call for creating a new group.
 */
export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
    isOpen,
    onClose,
    onGroupCreated,
}) => {
    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [currency, setCurrency] = useState('INR');

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    /**
     * Reset form to initial state
     */
    const resetForm = () => {
        setName('');
        setDescription('');
        setCurrency('INR');
        setError(null);
        setFieldErrors({});
    };

    /**
     * Handle modal close
     */
    const handleClose = () => {
        resetForm();
        onClose();
    };

    /**
     * Handle form submission
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});

        // Client-side validation
        if (!name.trim()) {
            setFieldErrors({ name: 'Group name is required' });
            return;
        }

        setIsSubmitting(true);

        try {
            const request: CreateGroupRequest = {
                name: name.trim(),
                description: description.trim() || undefined,
                currency,
                simplifyDebts: false,
            };

            const response = await api.post<CreateGroupResponse>('/groups', request);

            // Success - close modal and notify parent
            resetForm();
            onGroupCreated(response.groupId);
        } catch (err) {
            if (err instanceof ApiException) {
                setError(err.message);
                if (err.fieldErrors) {
                    setFieldErrors(err.fieldErrors);
                }
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Create Group">
            <form onSubmit={handleSubmit} className="create-group-form">
                {/* General error message */}
                {error && (
                    <div className="create-group-form__error" role="alert">
                        {error}
                    </div>
                )}

                {/* Group Name */}
                <Input
                    label="Group Name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={fieldErrors.name}
                    placeholder="e.g., Trip to Goa"
                    required
                    fullWidth
                    autoFocus
                />

                {/* Description */}
                <div className="input-wrapper input-wrapper--full-width">
                    <label htmlFor="description" className="input-label">
                        Description (optional)
                    </label>
                    <textarea
                        id="description"
                        className="input-field create-group-form__textarea"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., Beach vacation expenses"
                        rows={3}
                    />
                </div>

                {/* Currency */}
                <div className="input-wrapper input-wrapper--full-width">
                    <label htmlFor="currency" className="input-label">
                        Currency
                    </label>
                    <select
                        id="currency"
                        className="input-field"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                    >
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                    </select>
                </div>

                <div className="create-group-form__actions">
                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={isSubmitting}
                    >
                        Create Group
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateGroupModal;
