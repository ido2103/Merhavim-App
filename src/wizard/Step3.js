import React, { useState } from 'react';
import { Box, Button, Container } from '@cloudscape-design/components';
import { jsPDF } from 'jspdf';

// Add Hebrew font
const addHebrewSupport = async (doc) => {
  try {
    const response = await fetch('/fonts/Alef-Regular.ttf');
    const fontBuffer = await response.arrayBuffer();
    const fontBase64 = btoa(
      new Uint8Array(fontBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    doc.addFileToVFS('Alef-Regular.ttf', fontBase64);
    doc.addFont('Alef-Regular.ttf', 'Alef', 'normal');
    doc.setFont('Alef');
  } catch (error) {
    console.error('Error loading font:', error);
    throw new Error('Failed to load Hebrew font');
  }
};

export default function Step3({ patientID, formData, recordingUrl }) {
  const [pdfUrl, setPdfUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      
      // Create new document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true
      });

      // Add Hebrew support
      await addHebrewSupport(doc);

      // Set RTL mode
      doc.setR2L(true);

      // Set font size and line height
      const fontSize = 12;
      const lineHeight = 10;
      let yPosition = 20;

      // Add title
      doc.setFontSize(18);
      doc.text('סיכום רפואי', 190, yPosition, { align: 'right' });
      yPosition += lineHeight * 2;

      // Reset font size for content
      doc.setFontSize(fontSize);

      // Add content
      const addField = (label, value) => {
        doc.text(`${label}: ${value || ''}`, 190, yPosition, { align: 'right' });
        yPosition += lineHeight;
      };

      addField('מזהה מטופל', patientID);
      addField('מחלקת טיפול נמרץ', formData.icuWard);
      addField('אבחנה', formData.diagnosis);
      addField('הערות', formData.notes);

      // Generate PDF blob
      const pdfBlob = doc.output('blob');
      const pdfBlobUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfBlobUrl);
      setIsGenerating(false);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('שגיאה ביצירת PDF');
      setIsGenerating(false);
    }
  };

  return (
    <Container
      className="step-container"
      disableContentPaddings={false}
    >
      {/* Audio Player Section */}
      <Box margin={{ bottom: 'l' }}>
        {recordingUrl && (
          <audio 
            controls 
            src={recordingUrl}
            style={{
              width: '100%',
              marginBottom: '20px',
              borderRadius: '4px'
            }}
          />
        )}
      </Box>

      {/* Patient Summary Section */}
      <Box variant="h3" margin={{ top: 's' }}>
        סיכום עבור מטופל: {patientID || 'לא הוזן'}
      </Box>
      <Box variant="p">מחלקת טיפול נמרץ: {formData.icuWard}</Box>
      <Box variant="p">אבחנה: {formData.diagnosis}</Box>
      <Box variant="p">הערות: {formData.notes}</Box>

      <div style={{ marginTop: 20 }}>
        <Button 
          variant="primary" 
          size="large" 
          onClick={handleGeneratePDF}
          loading={isGenerating}
        >
          צור תצוגה מקדימה
        </Button>
      </div>

      {pdfUrl && (
        <div style={{ marginTop: 20 }}>
          <iframe
            src={pdfUrl}
            title="PDF Preview"
            style={{ width: '100%', height: '500px' }}
          />
        </div>
      )}
    </Container>
  );
}
