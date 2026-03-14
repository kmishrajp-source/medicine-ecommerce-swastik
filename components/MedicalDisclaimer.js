export default function MedicalDisclaimer() {
    return (
        <div style={{
            background: '#FEF2F2',
            borderLeft: '4px solid #DC2626',
            color: '#991B1B',
            padding: '16px',
            margin: '20px 0',
            borderRadius: '0 8px 8px 0',
            fontSize: '0.9rem',
            lineHeight: '1.5'
        }}>
            <strong style={{ display: 'block', marginBottom: '4px' }}>⚠️ Medical Disclaimer</strong>
            This tool provides informational guidance only and is not a medical diagnosis. Always consult a qualified doctor before taking any medication.
        </div>
    );
}
