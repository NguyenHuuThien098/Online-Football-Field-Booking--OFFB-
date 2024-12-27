    const handleAddField = async () => {
        try {
            const token = localStorage.getItem('token');
            const ownerId = localStorage.getItem('userId');
            const response = await axios.post('http://localhost:5000/api/field-owner/add-field', {
                ...newField,
                ownerId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setFields([...fields, response.data.field]);
            setNewField({
                name: '',
                location: '',
                type: '5 person',
                price: '',
                image: '',
                contactNumber: '',
                operatingHours: ''
            });
        } catch (error) {
            console.error("Error adding field:", error);
            setError('An error occurred while adding the field.');
        }
    };

    const handleUpdateField = async (fieldId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:5000/api/field-owner/update-field/${fieldId}`, newField, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setFields(fields.map(field => field.fieldId === fieldId ? response.data.field : field));
            setNewField({
                name: '',
                location: '',
                type: '5 persons',
                price: '',
                image: '',
                contactNumber: '',
                operatingHours: ''
            });
        } catch (error) {
            console.error("Error updating field:", error);
            setError('An error occurred while updating the field.');
        }
    };