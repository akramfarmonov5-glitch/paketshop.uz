import React, { useRef, useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface CloudinaryUploadProps {
    onUpload: (url: string) => void;
    currentImage?: string;
    label?: string;
}

const CLOUD_NAME = 'daazevmhg';
const UPLOAD_PRESET = 'unsigned_preset';

const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({
    onUpload,
    currentImage,
    label = "Rasm yuklash"
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Faqat rasm fayllari qabul qilinadi');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('Rasm 10MB dan kichik bo\'lishi kerak');
            return;
        }

        setError(null);
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', UPLOAD_PRESET);
            formData.append('folder', 'paketshop');

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error('Yuklashda xatolik yuz berdi');
            }

            const data = await response.json();
            const optimizedUrl = data.secure_url.replace('/upload/', '/upload/q_auto,f_auto,w_1200/');

            setPreview(optimizedUrl);
            onUpload(optimizedUrl);
        } catch (err) {
            console.error('Upload error:', err);
            setError('Rasm yuklashda xatolik. Qayta urinib ko\'ring.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onUpload('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
                <ImageIcon size={16} />
                {label}
            </label>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {preview ? (
                <div className="relative group">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl border border-white/10"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full h-48 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-gold-400/50 hover:bg-white/5 transition-all disabled:opacity-50"
                >
                    {isUploading ? (
                        <>
                            <Loader2 size={32} className="text-gold-400 animate-spin" />
                            <span className="text-gray-400 text-sm">Yuklanmoqda...</span>
                        </>
                    ) : (
                        <>
                            <Upload size={32} className="text-gray-500" />
                            <span className="text-gray-400 text-sm">Rasm tanlash uchun bosing</span>
                            <span className="text-gray-500 text-xs">PNG, JPG, WEBP (max 10MB)</span>
                        </>
                    )}
                </button>
            )}

            {error && (
                <p className="text-red-400 text-sm">{error}</p>
            )}
        </div>
    );
};

export default CloudinaryUpload;
