import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdChevronRight } from 'react-icons/md'
import './css/IdentityVerificationPage.css'
import securityInfographic from '../assets/security-infographic.png'

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

  const hasAllFiles = useMemo(
    () => files.residence !== null && files.selfie !== null,
    [files]
  )

  const handleFileChange = (id) => (event) => {
    const file = event.target.files?.[0] ?? null
    setFiles((current) => ({ ...current, [id]: file }))
    setUploadStatus('')
  }

  const handleChooseFile = (id) => {
    fileInputs.current[id]?.click()
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!hasAllFiles) {
      setUploadStatus('Please upload both documents before continuing.')
      return
    }

    setUploadStatus('Your documents are uploaded. Verification is in progress...')
    window.setTimeout(() => navigate('/account'), 1000)
  }

  return (
    <div className="identity-page">
      <main className="identity-card" aria-label="Identity verification form">
        <div className="identity-card__brand">
            <div className="identity-card__logo" aria-hidden="true">
            <img
              src={securityInfographic}
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
          {uploadItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="identity-item"
              onClick={() => handleChooseFile(item.id)}
            >
              <div>
                <p className="identity-item__title">{item.title}</p>
                <p className="identity-item__subtitle">
                  {files[item.id] ? files[item.id].name : item.subtitle}
                </p>
              </div>
              <MdChevronRight size={24} />
              <input
                ref={(el) => (fileInputs.current[item.id] = el)}
                type="file"
                accept={item.accept}
                capture={item.id === 'selfie' ? 'user' : undefined}
                className="sr-only"
                onChange={handleFileChange(item.id)}
              />
            </button>
          ))}

          <button
            type="submit"
            className="identity-card__submit"
            disabled={!hasAllFiles}
          >
            Continue
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
      </main>
    </div>
  )
}
