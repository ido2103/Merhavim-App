import React from 'react';
import { FormField, Input, Textarea, Container } from '@cloudscape-design/components';

export default function Step2({ formData, setFormData }) {
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Container
      header={<h2>פרטי הדרכה</h2>}
      className="step-container"
      disableContentPaddings={false}
    >
      <FormField label="מחלקת טיפול נמרץ">
        <Input
          value={formData.icuWard}
          onChange={({ detail }) => handleChange('icuWard', detail.value)}
          placeholder="לדוגמה, טיפול נמרץ..."
        />
      </FormField>

      <FormField label="אבחנה">
        <Input
          value={formData.diagnosis}
          onChange={({ detail }) => handleChange('diagnosis', detail.value)}
          placeholder="הקלד/י אבחנה"
        />
      </FormField>

      <FormField label="הערות">
        <Textarea
          value={formData.notes}
          onChange={({ detail }) => handleChange('notes', detail.value)}
          placeholder="הקלד/י הערות נוספות..."
        />
      </FormField>
    </Container>
  );
}
