import { useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MdChevronRight,MdErrorOutline, MdRefresh } from 'react-icons/md'
import './css/IdentityVerificationPage.css'
import securityInfographic from '../assets/kyc.png'
import securityInfographicDemo from '../assets/kycPurple.png'
import kycSuccess from '../assets/kyc-success.png'
import { uploadService } from '../services/uploadService'
import { getProfileId } from '../services/authService'
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

const isDemoEnv = (import.meta.env.VITE_APP_ENV || 'development') === 'demo'

export default function IdentityVerificationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = location.state?.returnTo
  const continueTo = location.state?.continueTo
  const fileInputs = useRef({})
  const [files, setFiles] = useState({ residence: null, selfie: null })
  const [uploadStatus, setUploadStatus] = useState('')
  const [activeUploadId, setActiveUploadId] = useState(null)
  const [itemStatus, setItemStatus] = useState({ residence: 'idle', selfie: 'idle' })
  const [uploadErrors, setUploadErrors] = useState({ residence: '', selfie: '' })
  const [isUploading, setIsUploading] = useState(false)
  const [cameraCaptureId, setCameraCaptureId] = useState(null)
  const [showSelfiePrep, setShowSelfiePrep] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const [reviewingCapture, setReviewingCapture] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const hasAllFiles = useMemo(
    () => files.residence !== null && files.selfie !== null,
    [files]
  )

  // Signing up lands here without a returnTo, so completion falls through to
  // home; arriving from an existing page (account, an insurance enquiry) sends
  // the user back to where they were instead of always to home.
  const goBackOrHome = () => {
    if (returnTo?.pathname) {
      navigate({ pathname: returnTo.pathname, search: returnTo.search }, { state: returnTo.state })
    } else {
      navigate('/list')
    }
  }

  // On successful verification, continue into the flow the user was
  // actually trying to reach (e.g. the insurance questionnaire or FICA
  // page) rather than dropping them back on the product list.
  const goToContinueOrHome = () => {
    const target = continueTo ?? returnTo
    if (target?.pathname) {
      navigate({ pathname: target.pathname, search: target.search }, { state: target.state })
    } else {
      navigate('/list')
    }
  }

  const handleFileChange = (id) => (event) => {
    const file = event.target.files?.[0] ?? null
    setFiles((current) => ({ ...current, [id]: file }))
    setUploadStatus('')
    setItemStatus((current) => ({ ...current, [id]: file ? 'success' : 'idle' }))
    setUploadErrors((current) => ({ ...current, [id]: '' }))
  }

  const handleOpenUploadSheet = (id) => {
    setActiveUploadId(id)
  }

  const handleCloseUploadSheet = () => {
    setActiveUploadId(null)
  }

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  const closeCameraCapture = () => {
    stopCameraStream()
    setCameraCaptureId(null)
    setCameraError('')
    setReviewingCapture(false)
    if (capturedPhoto?.url) {
      URL.revokeObjectURL(capturedPhoto.url)
    }
    setCapturedPhoto(null)
  }

  const startCameraCapture = async (id) => {
    setCameraError('')
    setReviewingCapture(false)
    if (capturedPhoto?.url) {
      URL.revokeObjectURL(capturedPhoto.url)
      setCapturedPhoto(null)
    }
    setCameraCaptureId(id)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: id === 'selfie' ? 'user' : 'environment',
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Camera capture failed:', error)
      setCameraError('Unable to access your camera. Please check permissions or try a different browser.')
      setCameraCaptureId(null)
    }
  }

  const handleModalOption = (id, option) => {
    if (option === 'camera') {
      if (id === 'selfie') {
        setShowSelfiePrep(true)
        handleCloseUploadSheet()
        return
      }
      startCameraCapture(id)
      handleCloseUploadSheet()
      return
    }

    const input = fileInputs.current[id]
    const item = uploadItems.find((entry) => entry.id === id)
    if (!input || !item) return

    if (option === 'photo') {
      input.setAttribute('accept', 'image/*')
      input.removeAttribute('capture')
    } else {
      input.setAttribute('accept', item.accept)
      input.removeAttribute('capture')
    }

    input.click()
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

    const userId = await getProfileId();
    if(!userId) {
      localStorage.removeItem('jwt');
      localStorage.removeItem('auth-mode');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
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
      window.setTimeout(() => goToContinueOrHome(), 800)
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
              src={hasAllFiles ? kycSuccess : (isDemoEnv ? securityInfographicDemo : securityInfographic)}
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
              className="sr-only"
              onChange={handleFileChange(item.id)}
            />
          ))}

          <button
            type="submit"
            className="identity-card__submit"
            disabled={!hasAllFiles || isUploading}
          >
            {isUploading ? 'Uploading…' : returnTo ? 'Continue' : 'Continue to Home'}
          </button>
          <button
            type="button"
            className="identity-card__secondary"
            disabled={isUploading}
            onClick={goBackOrHome}
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
                  onClick={() => handleModalOption(activeUploadId, 'camera')}
                >
                  Take photo with camera
                </button>
                <button
                  type="button"
                  className="upload-sheet__option"
                  onClick={() => handleModalOption(activeUploadId, 'photo')}
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

        {showSelfiePrep ? (
          <div className="selfie-prep__overlay" role="dialog" aria-modal="true">
            <div className="selfie-prep__panel" role="document">
              <div className="selfie-prep__header">
                <h2 className="selfie-prep__title">Prep for your selfie</h2>
                <button
                  type="button"
                  className="selfie-prep__close"
                  aria-label="Close selfie instructions"
                  onClick={() => setShowSelfiePrep(false)}
                >
                  ×
                </button>
              </div>
              <p className="selfie-prep__text">
                Start with good lighting and face forward so your eyes are open and clearly visible.
              </p>
              <ul className="selfie-prep__list">
                <li className="selfie-prep__item">
                  <p className="selfie-prep__item-title">Start with good lighting</p>
                  <p className="selfie-prep__item-text">Face forward and make sure your eyes are open and clearly visible.</p>
                </li>
                <li className="selfie-prep__item">
                  <p className="selfie-prep__item-title">Avoid face obstructions</p>
                  <p className="selfie-prep__item-text">Remove anything that covers your face. Eyeglasses are okay.</p>
                </li>
              </ul>
              <div className="selfie-prep__actions">
                <button
                  type="button"
                  className="selfie-prep__action"
                  onClick={() => {
                    setShowSelfiePrep(false)
                    startCameraCapture('selfie')
                  }}
                >
                  Got it
                </button>
                <button
                  type="button"
                  className="selfie-prep__cancel"
                  onClick={() => setShowSelfiePrep(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : cameraCaptureId ? (
          <div className="camera-capture__overlay" role="dialog" aria-modal="true">
            <div className="camera-capture__panel">
              <div className={`camera-capture__video-wrap${cameraCaptureId === 'selfie' ? ' camera-capture__video-wrap--selfie' : ''}`}>
                {reviewingCapture && capturedPhoto ? (
                  <img
                    src={capturedPhoto.url}
                    alt="Selfie preview"
                    className="camera-capture__preview"
                  />
                ) : (
                  <video ref={videoRef} autoPlay playsInline muted className="camera-capture__video" />
                )}
              </div>
              {reviewingCapture && capturedPhoto ? (
                <p className="camera-capture__preview-text">
                  Review your photo and submit when ready.
                </p>
              ) : null}
              <div className="camera-capture__controls">
                {reviewingCapture && capturedPhoto ? (
                  <>
                    <button
                      type="button"
                      className="camera-capture__action"
                      onClick={() => {
                        const blob = capturedPhoto.blob
                        if (!blob) return
                        const file = new File([
                          blob,
                        ], `${cameraCaptureId}-${Date.now()}.png`, {
                          type: 'image/png',
                        })
                        setFiles((current) => ({ ...current, [cameraCaptureId]: file }))
                        setItemStatus((current) => ({ ...current, [cameraCaptureId]: 'success' }))
                        setUploadErrors((current) => ({ ...current, [cameraCaptureId]: '' }))
                        setUploadStatus('')
                        closeCameraCapture()
                      }}
                    >
                      Submit selfie
                    </button>
                    <button
                      type="button"
                      className="camera-capture__action camera-capture__cancel"
                      onClick={() => {
                        setReviewingCapture(false)
                        setCapturedPhoto(null)
                        if (cameraCaptureId) {
                          startCameraCapture(cameraCaptureId)
                        }
                      }}
                    >
                      Retake selfie
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="camera-capture__action"
                      onClick={async () => {
                        if (!videoRef.current || !canvasRef.current) return
                        const video = videoRef.current
                        const canvas = canvasRef.current
                        const width = video.videoWidth
                        const height = video.videoHeight
                        if (!width || !height) return
                        canvas.width = width
                        canvas.height = height
                        const ctx = canvas.getContext('2d')
                        ctx.drawImage(video, 0, 0, width, height)
                        canvas.toBlob((blob) => {
                          if (!blob) return
                          const url = URL.createObjectURL(blob)
                          setCapturedPhoto({ url, blob })
                          setReviewingCapture(true)
                          stopCameraStream()
                        }, 'image/png')
                      }}
                    >
                      Capture photo
                    </button>
                    <button
                      type="button"
                      className="camera-capture__action camera-capture__cancel"
                      onClick={closeCameraCapture}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
              {cameraError ? <p className="camera-capture__error">{cameraError}</p> : null}
              <canvas ref={canvasRef} className="sr-only" />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
