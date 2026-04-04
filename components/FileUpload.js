"use client";
import { useState, useRef } from 'react';

export default function FileUpload({ onUploadComplete, onError }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        // Basic Validation
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!validTypes.includes(selectedFile.type)) {
            if (onError) onError("Only JPG, PNG, WEBP, and PDF files are allowed.");
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
            if (onError) onError("File size must be less than 5MB.");
            return;
        }

        setFile(selectedFile);

        // Generate Preview
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target.result);
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview('/images/pdf-icon.png'); // Fallback icon for PDF
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setProgress(20);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            setProgress(60);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setProgress(100);
            if (onUploadComplete) {
                onUploadComplete(data.url);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            if (onError) {
                onError(error.message || 'An error occurred during upload. Please try again.');
            }
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {!preview ? (
                <div 
                    onClick={() => fileInputRef.current.click()}
                    style={{
                        border: '2px dashed #93c5fd',
                        background: '#eff6ff',
                        padding: '30px',
                        textAlign: 'center',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                >
                    <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '2rem', color: '#3b82f6', marginBottom: '10px' }}></i>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#1e3a8a' }}>Click to select prescription</p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>JPG, PNG, PDF formats up to 5MB are accepted</p>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: '#e2e8f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                         {file.type.startsWith('image/') ? (
                             <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                         ) : (
                             <i className="fa-solid fa-file-pdf" style={{ fontSize: '2.5rem', color: '#ef4444' }}></i>
                         )}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        {uploading && (
                            <div style={{ width: '100%', background: '#e2e8f0', height: '6px', borderRadius: '3px', marginTop: '10px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: '#3b82f6', width: `${progress}%`, transition: 'width 0.3s' }}></div>
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {!uploading && (
                            <>
                                <button type="button" onClick={handleUpload} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    Upload
                                </button>
                                <button type="button" onClick={() => { setFile(null); setPreview(null); }} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                    Change
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
            
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/jpeg, image/png, image/webp, application/pdf" 
                style={{ display: 'none' }} 
            />
        </div>
    );
}
