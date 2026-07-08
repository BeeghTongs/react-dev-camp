import './css/DocumentsPage.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCheckCircle } from 'react-icons/md';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';
import { getProfileId } from '../services/authService';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import LoadingSpinner from '../components/LoadingSpinner';
import ReuploadModal from '../components/ReuploadModal';

const kycFolderLabel = (folder) => {
  if (folder === 'proof-of-residence') return 'Proof of residence';
  if (folder === 'selfie') return 'Selfie';
  return folder;
};

export default function DocumentsPage() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState(undefined);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reuploadFolder, setReuploadFolder] = useState(null);
  const [showReuploadToast, setShowReuploadToast] = useState(false);

  useEffect(() => {
    getProfileId().then((id) => setUserId(id ?? null));
  }, []);

  useEffect(() => {
    if (userId === undefined) return;
    if (userId === null) {
      setLoading(false);
      return;
    }

    const kycRef = ref(storage, `kyc/${userId}`);

    listAll(kycRef)
      .then(async (result) => {
        if (result.prefixes.length === 0 && result.items.length === 0) return;

        const folderRefs = result.prefixes.length > 0 ? result.prefixes : [kycRef];
        const folderResults = await Promise.all(folderRefs.map((folderRef) => listAll(folderRef)));
        const itemRefs = result.prefixes.length > 0
          ? folderResults.flatMap((folderResult) => folderResult.items)
          : result.items;

        const docs = await Promise.all(
          itemRefs.map(async (itemRef) => ({
            path: itemRef.fullPath,
            name: itemRef.name,
            folder: itemRef.parent?.name,
            url: await getDownloadURL(itemRef),
          }))
        );
        setDocuments(docs);
      })
      .catch((error) => console.error('[DocumentsPage] Failed to load documents:', error))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!showReuploadToast) return;
    const timer = setTimeout(() => setShowReuploadToast(false), 2500);
    return () => clearTimeout(timer);
  }, [showReuploadToast]);

  const handleDocumentReuploaded = (doc) => {
    setDocuments((current) => [...current.filter((entry) => entry.folder !== doc.folder), doc]);
    setReuploadFolder(null);
    setShowReuploadToast(true);
  };

  return (
    <div className="documents-page">
      <Header />
      <div className="documents-page__inner">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Back">
            <MdArrowBack />
          </button>
          <h1 className="documents-page__title">My Documents</h1>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading your documents…" />
        ) : documents.length > 0 ? (
          <ul className="documents-page__list">
            {documents.map((doc) => (
              <li key={doc.folder} className="documents-page__item">
                <span className="documents-page__item-name">{kycFolderLabel(doc.folder)}</span>
                <span className="documents-page__item-actions">
                  <a
                    className="documents-page__item-view"
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>
                  <button
                    type="button"
                    className="documents-page__item-reupload"
                    onClick={() => setReuploadFolder(doc.folder)}
                  >
                    Reupload
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="documents-page__empty">You haven't uploaded any documents yet.</p>
        )}
      </div>
      <BottomNav />

      {reuploadFolder && (
        <ReuploadModal
          userId={userId}
          documentType={reuploadFolder}
          documentLabel={kycFolderLabel(reuploadFolder)}
          onClose={() => setReuploadFolder(null)}
          onUploaded={handleDocumentReuploaded}
        />
      )}

      {showReuploadToast && (
        <div className="documents-page-toast" role="status">
          <MdCheckCircle className="documents-page-toast__icon" />
          Document reuploaded successfully
        </div>
      )}
    </div>
  );
}
