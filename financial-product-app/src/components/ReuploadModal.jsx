import { useState } from 'react';
import { deleteObject, listAll, ref } from 'firebase/storage';
import { MdClose } from 'react-icons/md';
import './css/ReuploadModal.css';
import { storage } from '../services/firebase';
import { uploadService } from '../services/uploadService';

const ACCEPT_BY_TYPE = {
  'proof-of-residence': '.png,.jpg,.jpeg,.pdf',
  selfie: '.png,.jpg,.jpeg',
};

function ReuploadModal({ userId, documentType, documentLabel, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files?.[0] ?? null);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Choose a file to upload.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // Clear out the previous file(s) for this document so reuploading
      // replaces rather than accumulates in storage.
      const folderRef = ref(storage, `kyc/${userId}/${documentType}`);
      const existing = await listAll(folderRef);
      await Promise.all(existing.items.map((itemRef) => deleteObject(itemRef)));

      const url = await uploadService(userId, documentType, file);
      onUploaded({ path: `${folderRef.fullPath}/${file.name}`, name: file.name, folder: documentType, url });
    } catch (err) {
      console.error('[ReuploadModal] Upload failed:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="reupload-modal__overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="reupload-modal" onClick={(event) => event.stopPropagation()}>
        <div className="reupload-modal__header">
          <h2 className="reupload-modal__title">Reupload {documentLabel}</h2>
          <button
            type="button"
            className="reupload-modal__close"
            aria-label="Close"
            onClick={onClose}
            disabled={isUploading}
          >
            <MdClose />
          </button>
        </div>

        <p className="reupload-modal__description">
          Upload a new file to replace your current {documentLabel.toLowerCase()}.
        </p>

        <form className="reupload-modal__form" onSubmit={handleSubmit}>
          <input
            type="file"
            accept={ACCEPT_BY_TYPE[documentType] ?? '*'}
            className="reupload-modal__file-input"
            onChange={handleFileChange}
            disabled={isUploading}
          />

          {file && <p className="reupload-modal__file-name">{file.name}</p>}
          {error && <p className="reupload-modal__error">{error}</p>}

          <div className="reupload-modal__actions">
            <button
              type="button"
              className="reupload-modal__btn reupload-modal__btn--ghost"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="reupload-modal__btn reupload-modal__btn--primary"
              disabled={isUploading || !file}
            >
              {isUploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReuploadModal;
