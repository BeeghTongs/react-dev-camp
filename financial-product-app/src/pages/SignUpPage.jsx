import { useNavigate } from 'react-router-dom'
import SignUpForm from '../components/SignUpForm.jsx'
import './css/SignUpPage.css'

function SignUpPage() {
  return (
    <main className="signup-page" aria-label="Sign up page">
      <section className="signup-card" aria-label="Create account panel">
        <SignUpForm />
      </section>
    </main>
  )
}

export default SignUpPage
