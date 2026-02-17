"use client";

export default function InvoicePrintButton() {
    return (
        <button
            onClick={() => window.print()}
            style={{
                background: '#0D8ABC',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '10px'
            }}
        >
            Download / Print PDF
        </button>
    );
}
