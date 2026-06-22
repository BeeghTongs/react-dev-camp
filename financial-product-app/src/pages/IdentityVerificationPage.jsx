import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdChevronRight,MdErrorOutline, MdRefresh } from 'react-icons/md'
import './css/IdentityVerificationPage.css'
import securityInfographic from '../assets/kyc.png'
import kycSuccess from '../assets/kyc-success.png'
import { uploadService } from '../services/uploadService'
import { GoCheckCircle } from "react-icons/go";

const uploadItems = [
  {
    id: 'residence',
    title: 'Proof of residence',
    subtitle: 'Proof of identity',
    accept: '.png,.jpg,.jpeg,.pdf',
  },
  {
    id: 'selfie',
    title: 'Selfie upload',
    subtitle: 'Proof of identity',
    accept: '.png,.jpg,.jpeg',
  },
]

export default function IdentityVerificationPage() {
  const navigate = useNavigate()
  const fileInputs = useRef({})
  const [files, setFiles] = useState({ residence: null, selfie: null })
  const [uploadStatus, setUploadStatus] = useState('')
  const [activeUploadId, setActiveUploadId] = useState(null)
  const [itemStatus, setItemStatus] = useState({ residence: 'idle', selfie: 'idle' })
  const [uploadErrors, setUploadErrors] = useState({ residence: '', selfie: '' })
  const [isUploading, setIsUploading] = useState(false)

  const hasAllFiles = useMemo(
    () => files.residence !== null && files.selfie !== null,
    [files]
  )

  const handleFileChange = (id) => (event) => {
    const file = event.target.files?.[0] ?? null
    setFiles((current) => ({ ...current, [id]: file }))
    setUploadStatus('')
    setItemStatus((current) => ({ ...current, [id]: file ? 'success' : 'idle' }))
    setUploadErrors((current) => ({ ...current, [id]: '' }))
  }

  const userIdFromLocalStorage = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    return user?.id || null
  }

  const handleOpenUploadSheet = (id) => {
    setActiveUploadId(id)
  }

  const handleCloseUploadSheet = () => {
    setActiveUploadId(null)
  }

  const handleModalOption = (id) => {
    fileInputs.current[id]?.click()
    handleCloseUploadSheet()
  }

  const handleRetry = (id) => {
    setItemStatus((current) => ({ ...current, [id]: 'idle' }))
    setUploadErrors((current) => ({ ...current, [id]: '' }))
    setActiveUploadId(id)
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!hasAllFiles) {
      setUploadStatus('Please upload both documents before continuing.');
      return;
    }

    setUploadStatus('Uploading documents...');
    setIsUploading(true);
    setItemStatus({ residence: 'idle', selfie: 'idle' })
    setUploadErrors({ residence: '', selfie: '' })

    const userId = userIdFromLocalStorage();
    if(!userId) {
      setUploadStatus('User ID not found. Please log in again.');
      setIsUploading(false);
      return;
    }
    const resultStatus = {}
    const resultErrors = {}

    for (const item of uploadItems) {
      const file = files[item.id]
      if (!file) {
        resultStatus[item.id] = 'error'
        resultErrors[item.id] = 'No file selected.'
        continue
      }

      try {
        await uploadService(userId, item.id === 'residence' ? 'proof-of-residence' : item.id, file)
        resultStatus[item.id] = 'success'
      } catch (error) {
        console.error(error)
        resultStatus[item.id] = 'error'
        resultErrors[item.id] = error?.message || 'Upload failed'
      }
    }

    setItemStatus((current) => ({ ...current, ...resultStatus }))
    setUploadErrors((current) => ({ ...current, ...resultErrors }))
    setIsUploading(false)

    const allSuccess = Object.values(resultStatus).every((status) => status === 'success')

    if (allSuccess) {
      setUploadStatus('Your documents are uploaded. Verification is in progress...')
      window.setTimeout(() => navigate('/list'), 800)
    } else {
      setUploadStatus('One or more uploads failed. Please try again.')
    }
  }

  return (
    <div className="identity-page">
      <main className="identity-card" aria-label="Identity verification form">
        <div className="identity-card__brand">
            <div className="identity-card__logo" aria-hidden="true">
            <img
              src={hasAllFiles ? kycSuccess : securityInfographic}
              alt="Identity verification illustration"
              className="identity-card__icon-image"
            />
            </div>
          <h1 className="identity-card__title">Identity verification</h1>
          <p className="identity-card__subtitle">
            We are committed to providing a safe secure shopping experience for our community and therefore your account must be verified by completing a KYC verification.
          </p>
        </div>

        <form className="identity-card__list" onSubmit={handleSubmit}>
          {uploadItems.map((item) => {
            const status = itemStatus[item.id]
            const hasError = status === 'error'
            const hasSuccess = status === 'success'

            return (
              <button
                key={item.id}
                type="button"
                className={`identity-item ${hasSuccess ? 'identity-item--success' : ''} ${hasError ? 'identity-item--error' : ''}`}
                onClick={() => handleOpenUploadSheet(item.id)}
              >
                <div>
                  <p className="identity-item__title">{item.title}</p>
                  <p className="identity-item__subtitle">
                    {files[item.id] ? files[item.id].name : item.subtitle}
                  </p>
                </div>

                <div className="identity-item__status">
                  {hasSuccess ? (
                    <GoCheckCircle size={24} className="identity-item__status-icon" />
                  ) : hasError ? (
                    <>
                      <span className="identity-item__retry" onClick={(event) => {
                        event.stopPropagation()
                        handleRetry(item.id)
                      }}>
                        Try again
                        <MdRefresh size={18} />
                      </span>
                      <MdErrorOutline size={24} className="identity-item__status-icon" />
                    </>
                  ) : (
                    <MdChevronRight size={24} />
                  )}
                </div>
              </button>
            )
          })}

          {uploadItems.map((item) => (
            <input
              key={`${item.id}-input`}
              ref={(el) => (fileInputs.current[item.id] = el)}
              type="file"
              accept={item.accept}
              capture={item.id === 'selfie' ? 'user' : undefined}
              className="sr-only"
              onChange={handleFileChange(item.id)}
            />
          ))}

          <button
            type="submit"
            className="identity-card__submit"
            disabled={!hasAllFiles}
          >
            Continue to Home
          </button>
          <button
            type="button"
            className="identity-card__secondary"
            onClick={() => navigate(-1)}
          >
            Not now
          </button>
          {uploadStatus ? (
            <p className="identity-card__status">{uploadStatus}</p>
          ) : null}
        </form>

        {activeUploadId ? (
          <div
            className="upload-sheet__overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-sheet-title"
            onClick={handleCloseUploadSheet}
          >
            <div
              className="upload-sheet"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="upload-sheet__handle" />
              <h2 id="upload-sheet-title" className="upload-sheet__title">
                {uploadItems.find((item) => item.id === activeUploadId)?.title || 'Upload file'}
              </h2>
              <p className="upload-sheet__description">
                Choose how you want to add the file for verification.
              </p>
              <div className="upload-sheet__actions">
                <button
                  type="button"
                  className="upload-sheet__option"
                  onClick={() => handleModalOption(activeUploadId)}
                >
                  Take photo with camera
                </button>
                <button
                  type="button"
                  className="upload-sheet__option"
                  onClick={() => handleModalOption(activeUploadId)}
                >
                  Upload photo
                </button>
                {activeUploadId !== 'selfie' ? (
                  <button
                    type="button"
                    className="upload-sheet__option"
                    onClick={() => handleModalOption(activeUploadId)}
                  >
                    Upload document
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                className="upload-sheet__close"
                onClick={handleCloseUploadSheet}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
