import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginSuccess } from '../store/slices/authSlice';
import { useLoginMutation } from '../store/authApi';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await login({ email, password }).unwrap();
      dispatch(loginSuccess({
        token: result.accessToken,
        user: {
          id: result.userId || '1',
          email,
          firstName: 'User',
          lastName: '',
          roles: ['Seeker', 'Provider']
        }
      }));
      localStorage.setItem('userId', result.userId);
      localStorage.setItem('accessToken', result.accessToken);
      navigate('/discovery', { replace: true });
    } catch (err) {
      setError('Email or password is incorrect');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FAFAF9' }}>
      {/* Left side: Visual moment */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16"
        style={{ backgroundColor: '#E8773D' }}
      >
        <blockquote>
          <p
            className="text-3xl font-semibold mb-6"
            style={{ color: '#FFFFFF', lineHeight: '1.4', maxWidth: '480px' }}
          >
            "I found a tennis partner who became a close friend. We play twice a week now."
          </p>
          <footer className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-semibold"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF' }}
            >
              M
            </div>
            <div>
              <div className="font-medium" style={{ color: '#FFFFFF' }}>Maya C.</div>
              <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Member since 2025</div>
            </div>
          </footer>
        </blockquote>
      </div>

      {/* Right side: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1
            className="text-4xl font-semibold mb-2"
            style={{ color: '#1A1614', lineHeight: '1.2' }}
          >
            Welcome back
          </h1>
          <p className="mb-8" style={{ color: '#746B66' }}>
            New here?{' '}
            <Link
              to="/register"
              className="font-medium hover:underline"
              style={{ color: '#E8773D' }}
            >
              Create an account
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: '#1A1614' }}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none"
                style={{
                  borderColor: '#E7E3E0',
                  color: '#1A1614',
                }}
                onFocus={(e) => e.target.style.borderColor = '#E8773D'}
                onBlur={(e) => e.target.style.borderColor = '#E7E3E0'}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{ color: '#1A1614' }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none"
                style={{
                  borderColor: '#E7E3E0',
                  color: '#1A1614',
                }}
                onFocus={(e) => e.target.style.borderColor = '#E8773D'}
                onBlur={(e) => e.target.style.borderColor = '#E7E3E0'}
              />
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-lg text-sm"
                style={{ backgroundColor: '#FEF3F3', color: '#D14343' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#E8773D',
                color: '#FFFFFF',
              }}
              onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#C65D28')}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E8773D'}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
